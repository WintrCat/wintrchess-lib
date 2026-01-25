import { Chess, Move, Role, Square, attacks, opposite } from "chessops";
import { minBy } from "es-toolkit";

import { LocatedPiece } from "@/types";

export const PIECE_VALUES: Record<Role, number> = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: Infinity
};

/**
 * Returns legal attackers of a square. Will not return any squares
 * if it is not the opposite colour of the square's turn to move.
 */
export function getAttackers(position: Chess, square: Square) {
    const moves = position.allDests();
    const attackers: LocatedPiece[] = [];

    for (const [from, dests] of moves.entries()) {
        if (!dests.has(square)) continue;
        
        const piece = position.board.get(from);
        if (!piece) continue;

        attackers.push({ ...piece, square: from });
    }

    return attackers;
}

/** Returns squares on which a piece can capture. */
export function getAttacks(
    position: Chess,
    square: Square,
    enforceLegal = true
) {
    const piece = position.board.get(square);
    if (!piece) throw new Error("no piece found.");

    let victims = attacks(piece, square, position.board.occupied)
        .intersect(position.board[opposite(piece.color)]);

    if (enforceLegal)
        victims = victims.intersect(position.dests(square));

    return victims;
}

/**
 * Returns the amount of material to be won by exchanging on a
 * given square. A negative number denotes material lost.
 */
export function evaluateExchange(
    position: Chess,
    square: Square,
    copyPosition = true
): number {
    if (copyPosition) position = position.clone();

    const victim = position.board.get(square);
    if (!victim) throw new Error("no piece to capture.");

    const lva = minBy(getAttackers(position, square),
        attacker => PIECE_VALUES[attacker.role]  
    );
    if (!lva) return 0;

    const attackMove: Move = { from: lva.square, to: square };
    if (!position.isLegal(attackMove)) attackMove.promotion = "queen";

    position.play(attackMove);

    return (
        PIECE_VALUES[victim.role]
        - evaluateExchange(position, square, false)
    );
}

/** Returns whether a piece can be taken for free. */
export function isPieceHanging(position: Chess, square: Square) {
    return evaluateExchange(position, square) > 0;
}