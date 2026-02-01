import { Chess } from "chessops";

import { AnalysedMove, ContextualCapture } from "@/types";
import { EngineLine } from "@/engine";
import { GameStage } from "@/utils";

export type AssessmentMoveContext = AnalysedMove & {
    /** Capturing moves the moved piece can now make. */
    attackMoves: ContextualCapture[];
    /** Capturing moves the piece could have made before `move`. */
    lastAttackMoves: ContextualCapture[];
};

export interface AssessmentContext {
    /** The position being explored. */
    position: Chess;
    /** The move that was just played in `position`. */
    move?: AssessmentMoveContext;
    /** The engine's analysis of `position`. */
    engineLines: EngineLine[];
    /** Openings database results for `position`. */
    database?: {}
    /** The stage of the game that this position is in. */
    stage: GameStage;
}

export interface AssessmentContextResult {
    /** The context for the given position. */
    current: AssessmentContext;
    /**
     * The context for the previous position, which may be the same
     * as what was given, or a new one that was calculated.
     */
    last?: AssessmentContext;
}