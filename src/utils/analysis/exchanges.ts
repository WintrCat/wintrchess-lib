import { Chess, Square, SquareSet } from "chessops";
import { minBy } from "es-toolkit";

import { ContextualCapture } from "@/types";
import {
    ExchangeOptions,
    ExchangeResult,
    HangingPiecesOptions,
    HangingPiece,
    PieceValues
} from "../types/exchanges";
import { getAttackerMoves } from "./attacks";

export const PIECE_VALUES: PieceValues = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: Infinity
};

/**
 * Returns the amount of material to be won by exchanging on a given square
 * with the least valuable attacker, or standing pat. Where `square` may be
 * captured by en passant, the exchange square may move to the destination
 * of the en passant move.
 */
export function evaluateExchange(
    position: Chess,
    square: Square,
    opts?: ExchangeOptions
): ExchangeResult {
    position = position.clone();

    const pieceValues = { ...PIECE_VALUES, ...opts?.pieceValueOverrides };
    const captures: ContextualCapture[] = [];

    let initialAttackerMoves: ContextualCapture[] | undefined;

    const see = (
        square: Square,
        move?: ContextualCapture,
        depth = 0
    ): number => {
        const victim = position.board.get(square);
        if (!victim) return 0;

        const excluded = opts?.excludedCapturers instanceof SquareSet
            ? opts.excludedCapturers : opts?.excludedCapturers?.(depth);

        // capture on the exchange square with the LVA
        const capturingMoves = getAttackerMoves(position, square, {
            enforceLegal: opts?.enforceLegal
        }).filter(move => !excluded?.has(move.from));
        initialAttackerMoves ??= capturingMoves;

        const lvaMove = minBy(capturingMoves, move => (
            pieceValues[move.piece.role]
        ));
        if (!lvaMove) return 0;

        position.play(lvaMove);
        captures.push(lvaMove);

        const value = pieceValues[move?.promotion ? "pawn" : victim.role]
            - ((depth == 0 && move) ? pieceValues[move.captured.role] : 0)
            - see(lvaMove.to, lvaMove, depth + 1);

        return (depth == 0 && (opts?.forceFirst ?? true))
            ? value : Math.max(0, value);
    };

    const existingCapture = opts?.move?.captured
        && opts.move as ContextualCapture;
    
    return {
        evaluation: see(square, existingCapture),
        captures: captures,
        initialAttackerMoves: initialAttackerMoves || []
    };
}

/**
 * Returns whether the opponent can exchange on this square
 * for a material gain of at least 1.
 */
export function isHanging(...args: Parameters<typeof evaluateExchange>) {
    return evaluateExchange(...args).evaluation > 0;
}

/** Finds and yields hanging pieces on a board. */
export function* getHangingPieces(
    position: Chess,
    opts?: HangingPiecesOptions
): Generator<HangingPiece> {
    const included = opts?.includedPieces || position.board.occupied;
    const minimumMaterialLoss = opts?.minimumMaterialLoss || 1;

    for (const square of included) {
        const exchange = evaluateExchange(position, square, opts);
        if (exchange.evaluation < minimumMaterialLoss) continue;

        const piece = position.board.get(square);
        if (!piece) continue;

        yield { ...piece, square, exchange };
    }
}