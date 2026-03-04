import { getHangingPieces } from "@/utils";
import { HangingPiecesOptions } from "@/utils/types/options";
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

    // Brilliants cannot leave you in a bad position
    if (current.top.sidedEvaluation.value < 0) return false;

    const piecesOptions: HangingPiecesOptions = {
        includedPieces: current.position.board[prev.position.turn],
        minimumMaterialGain: 2
    };

    const prevHanging = getHangingPieces(prev.position, piecesOptions);

    const hanging = getHangingPieces(current.position, {
        ...piecesOptions, move: current.move
    });

    // Moving a piece to safety cannot be brilliant, even if there are
    // other hanging pieces. This covers moving away from a fork.
    if (hanging.length < prevHanging.length) return false;

    return hanging.length > 0;
}