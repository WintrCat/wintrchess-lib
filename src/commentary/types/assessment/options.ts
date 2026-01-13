import { Chess } from "chessops";

import { ContextualMove } from "@/types";
import { EvaluateOptions } from "@/engine";
import { Observation } from "./observation";

export interface AssessmentOptions {
    /** The position to be assessed. */
    position: Chess;
    /** The move that was just played in `position`. */
    move?: ContextualMove;
    /** A list of observations to execute on each explored position. */
    observations?: Observation[];
    /** Options for engine analysis. */
    evaluations?: EvaluateOptions;
};

export interface RecursiveAssessmentOptions extends AssessmentOptions {
    recursion?: {}
}