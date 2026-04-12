import { WPLClassifyOptions } from "../types/ClassifyOptions";
import {
    WPLClassification,
    WPL_CLASSIFICATIONS
} from "../types/Classification";

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

    let fallback: WPLClassification | undefined;

    for (let i = WPL_CLASSIFICATIONS.length - 1; i >= 0; i -= 1) {
        const classif = WPL_CLASSIFICATIONS[i]!;
        if (opts?.exclude?.has(classif)) continue;

        fallback = classif;
        break;
    }

    if (!fallback)
        throw new Error("cannot exclude all WPL classifications.");

    const loss = Math.max(0, winPercentLoss);

    for (const classif of WPL_CLASSIFICATIONS) {
        if (opts?.exclude?.has(classif)) continue;
        if (loss < thresholds[classif]) return classif;
    }

    return fallback;
}