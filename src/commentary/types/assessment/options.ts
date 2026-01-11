import { Chess, NormalMove } from "chessops";

import { EvaluateOptions } from "@/engine";
import { Observation } from "./observation";

type OrWithoutMove<T extends object> = T | (
    Omit<T, "move" | "lastPosition">
    & { lastPosition?: never, move?: never }
);

interface BaseAssessmentOptions {
    /** The position to be assessed. */
    position: Chess;
    /** `position`, *before* `move` is applied. */
    lastPosition: Chess;
    /** The move that was just played in `position`. */
    move: NormalMove;
    /** A list of observations to execute on each explored position. */
    observations?: Observation[];
    /** Options for engine analysis. */
    evaluations?: EvaluateOptions;
};

export type AssessmentOptions = OrWithoutMove<BaseAssessmentOptions>;

export type RecursiveAssessmentOptions = (
    OrWithoutMove<BaseAssessmentOptions & {
        /** Options for recursing into other variations. */
        recursion?: {}
    }>
);

export type AssessmentContextOptions = OrWithoutMove<
    Omit<BaseAssessmentOptions, "observations">
>;