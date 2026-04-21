import { Chess, Square } from "chessops";

import { ExchangeOptions } from "../types/exchanges";
import { evaluateExchange } from "./exchanges";
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

    // Get amount of material to be gained by taking trapped piece
    // to ensure that it is at least hanging
    const currentExchange = evaluateExchange(position, square, opts);
    if (currentExchange.evaluation == 0) return false;

    const mateCheck = opts?.mateCheck ?? true;

    // Check that all legal moves still leave it hanging
    return getLegalMoves(position, square).every(move => {
        const escapePosition = withMove(position, move);

        // if moving it allows opponent mate, trapped
        const allowsMate = mateCheck && getLegalMoves(position).some(
            response => withMove(escapePosition, response).isCheckmate()
        );
        if (allowsMate) return true;

        const newExchange = evaluateExchange(
            escapePosition, move.to, { ...opts, move }
        );
        
        // if the new exchange is over 0, then it still loses some
        // of the piece's material to make this escape move
        return newExchange.evaluation > 0;
    });
}