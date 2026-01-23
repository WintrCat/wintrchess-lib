import { AssessmentContext } from "./context";

export interface AssessmentNode {
    /** The assessment for the previous position. */
    parent?: AssessmentNode;
    /** The assessments for any next positions. */
    children: AssessmentNode[];
    /** If this node contains the move of the primary continuation. */
    isSource: boolean;

    /** The results from executed observations. */
    statements: string[];
    /** The context produced to run observations on this position. */
    context: AssessmentContext;
}