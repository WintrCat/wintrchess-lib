import { Chess } from "chessops";

import { AnalysedMove } from "@/types";
import { EngineLine } from "@/engine";

export interface AssessmentContext {
    /** The position being explored. */
    position: Chess;
    /** The move that was just played in `position`. */
    move?: AnalysedMove;
    /** The engine's analysis of `position`. */
    engineLines: EngineLine[];
    /** Openings database results for `position`. */
    database?: {}
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