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
import { AssessmentNode } from "./types/assessment/node";
import { ExplanationOptions } from "./types/ExplanationOptions";
import { buildPrompt } from "./lib/prompt";
import { DEFAULT_OBSERVATIONS } from "./observations";

export class Commentary {
    engine: Engine;
    llm: OpenAI;

    constructor(opts: CommentaryOptions) {
        this.engine = opts.engine;
        this.llm = new OpenAI(opts.llm);
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
        nodeOpts?: {
            isSource?: boolean;
            parentNode?: AssessmentNode;
        }
    ): Promise<AssessmentNode> {
        const contexts = await this.getAssessmentContext(
            opts, nodeOpts?.parentNode?.context
        );

        const observations = opts.observations || DEFAULT_OBSERVATIONS;
        const statements: string[] = [];

        for (const observation of observations) {
            const result = await observation(
                contexts.current, contexts.last
            );

            if (Array.isArray(result)) {
                statements.push(...result);
            } else if (result) {
                statements.push(result);
            }
        }

        const node: AssessmentNode = {
            parent: nodeOpts?.parentNode,
            children: [],
            isSource: nodeOpts?.isSource || true,
            context: contexts.current,
            statements: statements
        };

        node.parent ??= contexts.last && {
            children: [node],
            isSource: false,
            context: contexts.last,
            statements: []
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

    /** Given an assessment, generate a natural language explanation. */
    async createExplanation(
        rootNode: AssessmentNode,
        opts: ExplanationOptions
    ) {
        const completion = await this.llm.chat.completions.create({
            model: opts.model,
            messages: [{
                role: "user",
                content: buildPrompt(rootNode, opts)
            }],
            temperature: opts.temperature || 1
        });

        const explanation = completion.choices[0];
        if (!explanation)
            throw new Error("failed to generate explanation.");

        return explanation.message.content || "";
    }
}