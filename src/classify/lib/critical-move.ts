import { makeUci, moveEquals } from "chessops/util";

import { isHanging } from "@/utils";
import { evaluationAs, getWinPercentLoss } from "@/engine";
import { ParsedNode, PreviousParsedNode } from "../types/ParsedNode";
import { isMoveImportant } from "./important-move";

/**
 * Returns whether a move can be classified as `critical`, given a
 * previous and current parsed analysis node.
 */
export function isMoveCritical(
    prev: PreviousParsedNode,
    current: ParsedNode,
    logs = false
) {
    const log = (msg: string) => {
        if (logs) console.log(msg);
        return false;
    };

    log(`testing ${makeUci(current.move)} for critical...`);

    if (!isMoveImportant(prev, current))
        return log("move was not considered important");

    if (!moveEquals(prev.top.move, current.move))
        return log("the move was not the top engine line");

    // A critical move cannot be a capture of free material
    if (
        current.move.captured
        && isHanging(prev.position, current.move.captured.square)
    ) return log("the move was a capture of free material");

    // If difference between top and second top is over 10% WPL
    // 10% loss is in between an inaccuracy and mistake
    const secondTopWinPercentLoss = getWinPercentLoss(
        evaluationAs(prev.top.evaluation, prev.position.turn),
        evaluationAs(prev.secondTop.evaluation, prev.position.turn)
    );

    log(`WPL between top and 2nd top move: ${secondTopWinPercentLoss}`);

    return secondTopWinPercentLoss >= 0.1;
}