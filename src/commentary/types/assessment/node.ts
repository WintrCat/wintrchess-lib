import { AssessmentContext } from "./context";
import { ObservationResult } from "./observation";

export interface AssessmentNode {
    /** The assessment for the previous position. */
    parent?: AssessmentNode;
    /** The assessments for any next positions. */
    children: AssessmentNode[];
    /** If this node contains the primary move being assessed. */
    isSource: boolean;

    /** The results from executed observations. */
    results: ObservationResult[];
    /** The context produced to run observations on this position. */
    context: AssessmentContext;
}