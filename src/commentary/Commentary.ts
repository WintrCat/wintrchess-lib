import { makeSan } from "chessops/san";
import { OpenAI } from "openai";

import {
    Engine,
    getCentipawnLoss,
    getEvaluation,
    getWinPercentLoss
} from "@/engine";
import { AnalysedMove } from "@/types";
import { CommentaryOptions } from "./types/CommentaryOptions";
import {
    AssessmentContext,
    AssessmentContextResult
} from "./types/assessment/context";
import {
    AssessmentOptions,
    RecursiveAssessmentOptions
} from "./types/assessment/options";
import { ObservationResult } from "./types/assessment/observation";
import { AssessmentNode } from "./types/assessment/node";
import { getAssessmentNodeMoves } from "./lib/assessment-node";
import { DEFAULT_OBSERVATIONS } from "./observations";

export class Commentary {
    engine: Engine;
    //llm: OpenAI;

    constructor(opts: CommentaryOptions) {
        this.engine = opts.engine;
        //this.llm = new OpenAI(opts.llm);
    }

    /**
     * Produce context to be used by observations. Some information
     * requires context from the last position; pass a `lastContext`
     * if you have this on hand, otherwise it can be recalculated.
     */
    async getAssessmentContext(
        opts: Omit<AssessmentOptions, "observations">,
        lastContext?: AssessmentContext
    ): Promise<AssessmentContextResult> {
        // Get engine lines
        this.engine.setPosition(opts.position);
        const lines = await this.engine.evaluate(opts.evaluations);

        // Calculate last context for dependent move data
        let analysedMove: AnalysedMove | undefined;

        if (opts.move) {
            lastContext ??= (await this.getAssessmentContext({
                evaluations: opts.evaluations,
                position: opts.move.lastPosition
            })).current;

            const lastEvaluation = getEvaluation(lastContext.engineLines);
            const evaluation = getEvaluation(lines);
            if (!lastEvaluation || !evaluation)
                throw new Error("engine produced invalid or no lines.");

            analysedMove = {
                ...opts.move,
                winPercentLoss: getWinPercentLoss(lastEvaluation, evaluation),
                centipawnLoss: getCentipawnLoss(lastEvaluation, evaluation)
            };
        }

        return {
            current: {
                position: opts.position,
                engineLines: lines,
                move: analysedMove
            },
            last: opts.move && lastContext
        };
    }

    /**
     * Produce context and execute observations on a position.
     * Context from the last position can be calculated or reused.
     */
    async createAssessment(
        opts: AssessmentOptions,
        parentNode?: AssessmentNode
    ): Promise<AssessmentNode> {
        const contexts = await this.getAssessmentContext(
            opts, parentNode?.context
        );

        const observations = opts.observations || DEFAULT_OBSERVATIONS;
        const results: ObservationResult[] = [];

        for (const observation of observations) {
            const result = await observation(
                contexts.current, contexts.last
            );

            if (result) results.push(result);
        }

        const node: AssessmentNode = {
            parent: parentNode,
            children: [],
            context: contexts.current,
            results: results
        };

        node.parent ??= contexts.last && {
            children: [node],
            context: contexts.last,
            results: []
        };

        return node;
    }

    /**
     * Create an assessment on a given position, and recurse into
     * other variations that are deemed relevant. Returns a map of
     * explored positions to their assessment results.
     */
    async createRecursiveAssessment(opts: RecursiveAssessmentOptions) {
        // const rootAssessment = await this.createAssessment(opts);

        throw new Error("not implemented yet.");
    }

    /** Given an assessment, builds a prompt for an LLM to process. */
    buildPrompt(rootAssessmentNode: AssessmentNode) {
        let prompt = "";

        const buildNode = (node: AssessmentNode) => {
            const moves = getAssessmentNodeMoves(node)
                .map(move => makeSan(move.lastPosition, move))
                .join(" ");

            const results = node.results
                .map(result => result.statement)
                .join("\n");

            prompt += `${moves}\n${results}\n\n`;

            for (const child of node.children) {
                buildNode(child);
            }
        };

        buildNode(rootAssessmentNode);
        return prompt.trim();
    }
}