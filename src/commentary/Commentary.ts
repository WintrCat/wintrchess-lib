import { OpenAI } from "openai";

import { Engine, getTopLine, getWinPercentLoss } from "@/engine";
import { AnalysedMove, contextualizeMove } from "@/types/ContextualMove";
import { CommentaryOptions } from "./types/CommentaryOptions";
import {
    AssessmentContext,
    AssessmentContextResult
} from "./types/assessment/context";
import {
    AssessmentContextOptions,
    AssessmentOptions,
    RecursiveAssessmentOptions
} from "./types/assessment/options";

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
        opts: AssessmentContextOptions,
        lastContext?: AssessmentContext
    ): Promise<AssessmentContextResult> {
        this.engine.setPosition(opts.position);
        const lines = await this.engine.evaluate(opts.evaluations);

        let analysedMove: AnalysedMove | undefined;

        if (opts.move) {
            lastContext ??= (await this.getAssessmentContext({
                evaluations: opts.evaluations,
                position: opts.lastPosition
            })).current;

            const lastTopMove = getTopLine(lastContext.engineLines);
            const topMove = getTopLine(lines);

            

            // TO-DO: calculate win% loss between last and current ctx
            

            analysedMove = {
                ...contextualizeMove(opts.lastPosition, opts.move),
                winPercentLoss: 0
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

    /** Produce context and execute observations on a position. */
    async createAssessment(opts: AssessmentOptions) {
        const context = await this.getAssessmentContext(opts);

        
    }

    /**
     * Create an assessment on a given position, and recurse into
     * other variations that are deemed relevant. Returns a map of
     * explored positions to their assessment results.
     */
    async createRecursiveAssessment(opts: RecursiveAssessmentOptions) {
        await this.createAssessment(opts);
    }
}