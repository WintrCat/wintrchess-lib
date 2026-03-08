import { EngineLine } from "./EngineLine";

export interface EvaluateOptions {
    depth?: number;
    timeLimit?: number;
    onUpdate?: (lines: EngineLine[]) => void;
}

export const DEFAULT_DEPTH = 16;