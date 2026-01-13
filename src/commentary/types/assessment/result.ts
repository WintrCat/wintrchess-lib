import { AssessmentContextResult } from "./context";
import { ObservationResult } from "./observation";

export interface Assessment {
    results: ObservationResult[];
    contexts: AssessmentContextResult;
}