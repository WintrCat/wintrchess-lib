import { Chess } from "chessops";

import { AnalysedMove, contextualizeMove } from "@/types/ContextualMove";
import { CommentaryOptions } from "./types/CommentaryOptions";
import { AssessmentOptions } from "./types/assessment";
import { ProcessEngine } from "@/engine";

export class Commentary {
    options: CommentaryOptions;

    constructor(opts: CommentaryOptions) {
        this.options = opts;
    }

    async observePosition(opts: AssessmentOptions) {
        const lines = await this.options.engine.evaluate({
            depth: 18
        });

        const observations = opts.observations || [];

        for (const observation of observations) {
            observation({
                position: opts.position,
                move: opts.move && contextualizeMove(
                    opts.lastPosition, opts.move
                ) as AnalysedMove,
                engineLines: lines
            });
        }
    }

    /**
     * Analyse a position and played move, recursing into any follow-up
     * or alternative variations deemed relevant to explore. Create
     * natural language statements from observations made on each
     * explored position. Returns the explored tree of positions.
     */
    async createAssessment(opts: AssessmentOptions) {
        await this.observePosition(opts);
    }
}

const coach = new Commentary({
    engine: new ProcessEngine("./engines/stockfish.exe"),
    llm: {
        apiKey: ""
    }
});

coach.createAssessment({
    position: Chess.default(),
    observations: [
        () => {
            return { statement: "amazing" };
        }
    ]
});