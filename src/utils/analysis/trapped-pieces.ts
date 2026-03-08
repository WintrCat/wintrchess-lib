import { Chess, Square } from "chessops";
import { sumBy } from "es-toolkit";

import { ExchangeOptions } from "../types/exchanges";
import { getHangingPieces, isHanging } from "./exchanges";
import { getLegalMoves, withMove } from "./legal-moves";

export interface TrappedPieceOptions extends ExchangeOptions {
    /**
     * Whether to check if moves that a potentially trapped piece can
     * make allow a checkmate from the opponent. If they do, then the
     * piece may be considered trapped, even if it is able to move to
     * a safe square. Defaults to `true`.
     */
    mateCheck?: boolean;
}

/**
 * Returns whether the piece on `square`, if any, is trapped. As in, it
 * is currently hanging, and any move it can make would hang the same
 * amount or more material.
 */
export function isPieceTrapped(
    position: Chess,
    square: Square,
    opts?: TrappedPieceOptions
) {
    const piece = position.board.get(square);
    if (!piece) return false;

    position = position.clone();
    position.turn = piece.color;

    if (!isHanging(position, square, opts)) return false;

    // If moving the piece increases the total material hanging for the
    // mover, it's still trapped even if it has a safe square to go to.
    // this covers when moving it reveals an attack on a piece behind.
    const mateCheck = opts?.mateCheck ?? true;

    const currentHanging = sumBy(
        getHangingPieces(position, {
            ...opts,
            includedPieces: position.board[piece.color]
        }),
        piece => piece.exchange.evaluation
    );

    return getLegalMoves(position, square).every(move => {
        const escapePosition = withMove(position, move);

        const allowsMate = mateCheck && getLegalMoves(position).some(
            response => withMove(escapePosition, response).isCheckmate()
        );
        if (allowsMate) return true;

        const newHanging = sumBy(
            getHangingPieces(escapePosition, {
                ...opts,
                includedPieces: escapePosition.board[piece.color],
                move: move
            }),
            piece => piece.exchange.evaluation
        );
        
        return newHanging >= currentHanging;
    });
}