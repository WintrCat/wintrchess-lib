import { isHanging } from "@/utils";
import { getWinPercentLoss } from "@/engine";
import { ParsedNode, PreviousParsedNode } from "../types/ParsedNode";
import { isMoveImportant } from "./important-move";

/**
 * Returns whether a move can be classified as `critical`, given a
 * previous and current parsed analysis node.
 */
export function isMoveCritical(
    prev: PreviousParsedNode,
    current: ParsedNode
) {
    if (!isMoveImportant(prev, current)) return false;

    // A critical move cannot be a capture of free material
    if (
        current.move.captured
        && isHanging(prev.position, current.move.captured.square)
    ) return false;

    // If difference between top and second top is over 10% WPL
    // 10% loss is in between an inaccuracy and mistake
    const secondTopWinPercentLoss = getWinPercentLoss(
        prev.top.sidedEvaluation,
        prev.secondTop.sidedEvaluation
    );

    return secondTopWinPercentLoss >= 0.1;
}