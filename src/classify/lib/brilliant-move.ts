import { sumBy } from "es-toolkit";

import {
    HangingPiecesOptions,
    getAttackerMoves,
    getHangingPieces,
    getLegalMoves,
    withMove,
    isPieceTrapped
} from "@/utils";
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

    // Moving a piece to safety cannot be brilliant, even if there are
    // other hanging pieces. This covers moving away from a fork.
    const piecesOptions: HangingPiecesOptions = {
        includedPieces: current.position.board[prev.position.turn],
        minimumMaterialGain: 2
    };

    const prevHanging = getHangingPieces(prev.position, piecesOptions);

    const hanging = getHangingPieces(current.position, {
        ...piecesOptions, move: current.move
    });
    
    if (hanging.length < prevHanging.length) return false;

    // If total amount of material threatened by mover is equal or greater
    // than that threatened by the opponent, danger levels & not brilliant.
    const opponentHanging = getHangingPieces(current.position, {
        includedPieces: current.position.board[current.position.turn],
        minimumMaterialGain: 2
    });

    if (
        sumBy(opponentHanging, piece => piece.exchange)
        >= sumBy(hanging, piece => piece.exchange)
    ) return false;

    // If taking any of the mover's hanging pieces all allow mate in 1,
    // this move is not awesome enough for brilliant!
    const allCapturesAllowMate = hanging.every(piece => (
        getAttackerMoves(current.position, piece.square).every(move => {
            const position = withMove(current.position, move);

            return getLegalMoves(position).some(response => (
                withMove(position, response).isCheckmate()
            ));
        })
    ));
    if (allCapturesAllowMate) return false;

    // If all the mover's hanging pieces are trapped anyway, not brilliant
    // If a move is made to untrap a piece, not brilliant
    const prevTrappedPieces = prevHanging.filter(piece => (
        isPieceTrapped(prev.position, piece.square)
    ));

    const trappedPieces = hanging.filter(piece => isPieceTrapped(
        current.position, piece.square, { move: current.move }
    ));

    if (
        trappedPieces.length == hanging.length
        || trappedPieces.length < prevTrappedPieces.length
    ) return false;

    // If the moved piece was trapped (desperado), not brilliant
    const movedPieceTrapped = prevTrappedPieces.some(
        piece => piece.square == current.move.from
    );
    if (movedPieceTrapped) return false;

    return hanging.length > 0;
}