import {
    ClassifyContext,
    PreviousClassifyContext
} from "@/classify/types/ClassifyContext";
import { DEFAULT_WPL_THRESHOLDS } from "../wpl-classify";

/**
 * Returns whether a move can be classified as `miss`, given classify
 * contexts. A move is a miss if the opponent's move before the current
 * one meets a certain Win% loss threshold, and the current move loses
 * at least 70% of the advantage gained by said mistake. By default,
 * the threshold is the default one for an inaccuracy. If the move loses
 * way more than just that advantage (more than 140% of the advantage
 * is lost), a move will not be considered a miss.
 */
export function isMoveMiss(
    prev: PreviousClassifyContext,
    current: ClassifyContext,
    wplThreshold = DEFAULT_WPL_THRESHOLDS.inaccuracy
) {
    if (prev.winPercentLoss == undefined) return false;

    // win% loss must be between 70% and 140% of the last win% loss
    return prev.winPercentLoss >= wplThreshold
        && current.winPercentLoss >= (prev.winPercentLoss * 0.7)
        && current.winPercentLoss < (prev.winPercentLoss * 1.4);
}