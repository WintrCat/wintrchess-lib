import { AssessmentContextResult } from "./context";
import { ObservationResult } from "./observation";

export interface Assessment {
    /** The results from executed observations. */
    results: ObservationResult[];
    /** The contexts produced or maybe reused by the assessment. */
    contexts: AssessmentContextResult;
}