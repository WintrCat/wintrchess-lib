import { OpenAI } from "openai";
import { makeFen } from "chessops/fen";

import {
    Engine,
    getCentipawnLoss,
    getEvaluation,
    getWinPercentLoss
} from "@/engine";
import { getAttackMoves, getGameStage } from "@/utils";
import { beforeMove } from "@/types";
import { CoachOptions } from "./types/CoachOptions";
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
import { log } from "./lib/logging";
import { buildPrompt } from "./lib/prompt";
import { DEFAULT_OBSERVATIONS } from "./observations";

export class Coach {
    engine: Engine;
    llm: OpenAI;

    constructor(opts: CoachOptions) {
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

        // Setup a contexts result
        const contexts: AssessmentContextResult = {
            current: {
                position: opts.position,
                engineLines: lines,
                stage: getGameStage(opts.position.board)
            },
            last: opts.move && lastContext
        };

        // Get move context, maybe requiring calculation of last context
        if (!opts.move) return contexts;
        const lastPosition = beforeMove(opts.position, opts.move);

        contexts.last ??= (await this.getAssessmentContext({
            evaluations: opts.evaluations,
            position: lastPosition
        })).current;

        const lastEvaluation = getEvaluation(contexts.last.engineLines);
        const evaluation = getEvaluation(lines);
        if (!lastEvaluation || !evaluation)
            throw new Error("engine produced invalid or no lines.");

        const lossArgs = [
            lastEvaluation,
            evaluation,
            lastPosition.turn
        ] as const;

        contexts.current.move = {
            ...opts.move,
            lastPosition: lastPosition,
            winPercentLoss: getWinPercentLoss(...lossArgs),
            centipawnLoss: getCentipawnLoss(...lossArgs),
            lastAttackMoves: getAttackMoves(
                lastPosition, opts.move.from
            ),
            attackMoves: getAttackMoves(opts.position, opts.move.to)
        };

        return contexts;
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
        const startTime = performance.now();
        if (opts.logs) log("info",
            `assessing ${makeFen(opts.position.toSetup())}`
        );

        const contexts = await this.getAssessmentContext(
            opts, nodeOpts?.parentNode?.context
        );

        if (opts.logs) log("success", "generated current context"
            + (nodeOpts?.parentNode?.context ? "" : " and last context.")
        );

        const observations = opts.observations || DEFAULT_OBSERVATIONS;
        const results = observations.map(async (obs, index) => {
            const result = await obs(contexts.current, contexts.last);

            if (opts.logs) log("success",
                `executed ${++index} of ${observations.length} `
                + `observations: ${JSON.stringify(result)}`
            );

            return result;
        });

        const statements = (await Promise.all(results))
            .filter(res => res != null).flat();

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
        
        const elapsed = (performance.now() - startTime) / 1000;
        if (opts.logs) log("success",
            `assessement complete (${elapsed.toFixed(3)}s)`
        );

        return node;
    }

    /**
     * Create an assessment on a given position, and recurse into
     * other variations that are deemed relevant. Returns a tree of
     * explored positions and their assessments.
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
        const startTime = performance.now();

        if (opts.logs) log("info", [
            "generating explanation for root node",
            `\tposition: ${makeFen(rootNode.context.position.toSetup())}`,
            `\tmodel: ${opts.model}`,
            `\tpersonality: ${opts.personality}`
        ].join("\n"));

        const completion = await this.llm.chat.completions.create({
            model: opts.model,
            messages: [{
                role: "user",
                content: buildPrompt(rootNode, opts)
            }],
            temperature: opts.temperature || 1
        });

        const explanation = completion.choices[0];
        if (!explanation) {
            if (opts.logs) log("error", "failed to generate explanation");
            throw new Error("failed to generate explanation.");
        }

        const elapsed = (performance.now() - startTime) / 1000;
        if (opts.logs) log("success",
            `successfully generated explanation (${elapsed.toFixed(3)}s)`
        );

        return explanation.message.content || "";
    }
}