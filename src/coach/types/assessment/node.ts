import { AssessmentContext } from "./context";

/** A position in the tree of positions explored by an assessment. */
export interface AssessmentNode {
    /** The assessment for the previous position. */
    parent?: AssessmentNode;
    /** The assessments for any next positions. */
    children: AssessmentNode[];
    /**
     * If this node represents the position initially passed for the
     * assessment.
     */
    isSource: boolean;

    /** The results from executed observations. */
    statements: string[];
    /** The context produced to run observations on this position. */
    context: AssessmentContext;
}