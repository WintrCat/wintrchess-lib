import { Chess, NormalMove } from "chessops";

import { EngineLine } from "@/engine";
import { Classification, WPLClassification } from "./Classification";

export interface ClassifyOptions {
    /** Which classifications to exclude from the result. */
    exclude?: Set<Classification>;
    /**
     * The Win% loss thresholds for Win% loss based classifications.
     * Defaults to those on [WintrChess](https://wintrchess.com).
     */
    wplThresholds?: Partial<Record<WPLClassification, number>>;
    /** Whether to output debug logs through `console.log`. */
    logs?: boolean;
}

export interface ClassifyContextOptions {
    /** Position before the move being classified was played. */
    position: Chess;
    /** The move to be classified. */
    move: NormalMove;
    /** The engine lines calculated on relevant positions. */
    engineLines: {
        /** The engine lines on the position before `move` is played. */
        previous: EngineLine[];
        /** The engine lines on the position after `move` is played. */
        current: EngineLine[];
    }
}

export type ClassifyArgs = ClassifyOptions & ClassifyContextOptions;