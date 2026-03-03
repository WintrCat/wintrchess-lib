import { ParsedNode, PreviousParsedNode } from "../types/ParsedNode";
import { isMoveImportant } from "./important-move";

/**
 * Returns whether a move can be classified as `brilliant`, given a
 * previous and current parsed analysis node.
 */
export function isMoveBrilliant(
    prev: PreviousParsedNode,
    current: ParsedNode
) {
    if (!isMoveImportant(prev, current)) return false;

    return false;
}