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
import { Assessment } from "./types/assessment/result";

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
                throw new Error("engine produced invalid lines.");

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
        lastContext?: AssessmentContext
    ): Promise<Assessment> {
        const contexts = await this.getAssessmentContext(opts, lastContext);

        const observations = opts.observations || [];
        const results: ObservationResult[] = [];

        for (const observation of observations) {
            const result = observation(contexts.current);
            if (result) results.push(result);
        }

        return { results, contexts };
    }

    /**
     * Create an assessment on a given position, and recurse into
     * other variations that are deemed relevant. Returns a map of
     * explored positions to their assessment results.
     */
    async createRecursiveAssessment(opts: RecursiveAssessmentOptions) {
        const rootAssessment = await this.createAssessment(opts);

        rootAssessment.contexts;
    }
}