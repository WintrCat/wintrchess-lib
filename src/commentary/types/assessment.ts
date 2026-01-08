import { Chess, NormalMove } from "chessops";

import { AnalysedMove } from "@/types/ContextualMove";
import { EngineLine } from "@/engine";

type OrWithoutMove<T extends object> = T | (
    Omit<T, "move" | "lastPosition">
    & { lastPosition?: never, move?: never }
);

export type AssessmentOptions = OrWithoutMove<{
    /** The position to be assessed. */
    position: Chess;
    /** `position`, *before* `move` is applied. */
    lastPosition: Chess;
    /** The move that was just played in `position`. */
    move: NormalMove;
    /** A list of observations to execute on each explored position. */
    observations?: Observation[];
    /** Options for recursing into other variations. */
    recursion?: {}
}>;

export interface AssessmentContext {
    /** The position being explored. */
    position: Chess;
    /** The move that was just played in `position`. */
    move?: AnalysedMove;
    /** The engine's analysis of `position`. */
    engineLines: EngineLine[];
};

export type Observation = (
    (ctx: AssessmentContext) => ObservationResult | null
);

export interface ObservationResult {
    statement: string;
    priority?: "low" | "medium" | "high";
}