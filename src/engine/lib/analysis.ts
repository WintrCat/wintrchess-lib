import { Color } from "chessops";
import { clone } from "es-toolkit";

import { EngineLine } from "../types/EngineLine";
import { Evaluation } from "../types/Evaluation";

/** Returns the highest depth line of index 1. */
export function getTopLine(lines: EngineLine[]) {
    let top: EngineLine | undefined;
    
    for (const line of lines) {
        if (line.index != 1) continue;
        if (!top || line.depth >= top.depth) top = line;
    }

    return top;
}

/** Returns the evaluation from a set of lines for a given position. */
export function getEvaluation(lines: EngineLine[]) {
    return getTopLine(lines)?.evaluation;
}

/**
 * Returns the probability of winning from an evaluation (0-1).
 * Based on https://lichess.org/page/accuracy.
 */
export function getWinPercent(
    evaluation: Evaluation,
    perspective: Color = "white"
) {
    const multiplier = -0.00368208;

    const objectivePercent = evaluation.type == "mate"
        ? Number(evaluation.value > 0)
        : 1 / (1 + Math.exp(multiplier * evaluation.value));

    return perspective == "white"
        ? objectivePercent
        : 1 - objectivePercent;
}

/** Returns the Win% loss between 2 consecutive evaluations. */
export function getWinPercentLoss(
    before: Evaluation,
    after: Evaluation
) {
    const loss = getWinPercent(before) - getWinPercent(after);
    return Math.max(0, loss);
}