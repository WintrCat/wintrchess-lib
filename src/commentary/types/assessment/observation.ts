import { AssessmentContext } from "./context";

export interface ObservationResult {
    statement: string;
    // priority?: "low" | "medium" | "high";
}

type NullableResult = ObservationResult | null;

export type Observation = (
    ctx: AssessmentContext,
    lastCtx?: AssessmentContext
) => NullableResult | Promise<NullableResult>;