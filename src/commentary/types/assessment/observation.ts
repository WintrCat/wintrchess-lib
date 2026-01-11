import { AssessmentContext } from "./context";

export type Observation = (
    (ctx: AssessmentContext) => ObservationResult | null
);

export interface ObservationResult {
    statement: string;
    priority?: "low" | "medium" | "high";
}