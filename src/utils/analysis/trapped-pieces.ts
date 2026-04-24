import { Chess, Square } from "chessops";

import { ExchangeOptions } from "../types/exchanges";
import { getHangingPieces } from "./exchanges";
import { getLegalMoves, withMove } from "./legal-moves";
import { squareSetOf } from "../square-sets";

export interface TrappedPieceOptions extends ExchangeOptions {
    /**
     * Whether to check if moves that a potentially trapped piece can
     * make would reveal an attack on another piece behind it. For those
     * that do, the escape square can be considered unsafe even if
     * the original piece is, at least itself, safe. Defaults to `true`.
     */
    transitiveAttackCheck?: boolean;
    /**
     * Whether to check if moves that a potentially trapped piece can
     * make allow a checkmate from the opponent. For those that do,
     * the escape square can be considered unsafe even if the original
     * piece is, at least itself, safe. Defaults to `true`.
     */
    mateCheck?: boolean;
    /**
     * The minimum amount of material that must be losable to consider
     * a piece hanging, either on its current square or any squares it
     * may attempt to escape to. This same rule applies for pieces
     * whose attacks are revealed after an escape square is attempted.
     */
    minimumMaterialLoss?: number;
    /**
     * Whether or not attacks that exist after the piece attempts to
     * escape to a square must be a direct cause of that move. If this
     * is `false`, then a piece may be considered trapped if all of its
     * moves simply fail to address a greater or equal threat somewhere
     * else on the board. Defaults to `true`.
     */
    diffAttacks?: boolean;
}

/**
 * Returns whether the piece on `square`, if any, is trapped. Trapped pieces
 * must be hanging on their current square. Each legal move it has will then
 * be checked to ensure that any escape square it can go to would still
 * render it hanging. You can also use the options to configure what
 * criteria must be met to consider an escape square unsafe.
 */
export function isPieceTrapped(
    position: Chess,
    square: Square,
    opts: TrappedPieceOptions = {}
) {
    const piece = position.board.get(square);
    if (!piece) return false;

    position = position.clone();
    position.turn = piece.color;

    // defaults for options
    opts.transitiveAttackCheck ??= true;
    opts.mateCheck ??= true;
    opts.minimumMaterialLoss ??= 2;
    opts.diffAttacks ??= true;

    const currentHanging = squareSetOf(
        getHangingPieces(position, {
            ...opts,
            includedPieces: position.board[piece.color],
            minimumMaterialLoss: opts.minimumMaterialLoss
        }).toArray()
    );
    if (!currentHanging.has(square)) return false;

    return getLegalMoves(position, square).every(move => {
        const escapePosition = withMove(position, move);

        // do mate check if configured
        const allowsMate = opts.mateCheck && getLegalMoves(position).some(
            response => withMove(escapePosition, response).isCheckmate()
        );
        if (allowsMate) return true;

        // calculate hanging pieces that exist because of the escape
        const afterHanging = getHangingPieces(escapePosition, {
            ...opts,
            includedPieces: escapePosition.board[piece.color],
            minimumMaterialLoss: opts.minimumMaterialLoss,
            move: move
        });

        return opts.diffAttacks
            ? afterHanging.some(piece => opts.transitiveAttackCheck
                ? !currentHanging.has(piece.square)
                : piece.square == move.to
            )
            : afterHanging.take(1).toArray().length > 0;
    });
}