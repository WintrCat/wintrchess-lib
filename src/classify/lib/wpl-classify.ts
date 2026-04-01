import { WPLClassifyOptions } from "../types/ClassifyOptions";
import { WPLClassification } from "../types/Classification";

export const DEFAULT_WPL_THRESHOLDS: Record<WPLClassification, number> = {
    best: 0.01,
    excellent: 0.035,
    okay: 0.07,
    inaccuracy: 0.1,
    mistake: 0.2,
    blunder: 1
};

/** Classify a move based only on Win% loss. */
export function wplClassify(
    winPercentLoss: number,
    opts?: WPLClassifyOptions
): WPLClassification {
    const thresholds = {
        ...DEFAULT_WPL_THRESHOLDS,
        ...opts?.wplThresholds
    };

    for (const classifKey in thresholds) {
        const classif = classifKey as WPLClassification;

        if (opts?.exclude?.has(classif)) continue;
        if (winPercentLoss < thresholds[classif]) return classif;
    }

    return "blunder";
}