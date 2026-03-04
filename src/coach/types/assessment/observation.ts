import { AssessmentContext } from "./context";

export type ObservationResult = string | string[] | null;

export type Observation = (
    ctx: AssessmentContext,
    lastCtx?: AssessmentContext
) => ObservationResult | Promise<ObservationResult>;