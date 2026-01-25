import {
    Chess,
    NormalMove,
    Role,
    Square,
    SquareSet,
    attacks,
    opposite
} from "chessops";
import { minBy } from "es-toolkit";

import { contextualizeMove, ContextualMove } from "@/types";
import { isPromotion } from "./pawns";

type ContextualCapture = Omit<ContextualMove, "captured">
    & Required<Pick<ContextualMove, "captured">>;

const PROMOTABLE_ROLES: Role[] = ["knight", "bishop", "rook", "queen"];

export const PIECE_VALUES: Record<Role, number> = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: Infinity
};

/** Returns moves that would capture this piece. */
export function getAttackerMoves(
    position: Chess,
    square: Square,
    enforceLegal = true
) {
    const piece = position.board.get(square);
    if (!piece) throw new Error("no piece found.");

    const enemies = position.board[opposite(piece.color)];
    const attackingMoves: ContextualCapture[] = [];

    for (const enemySquare of enemies) {
        const enemy = position.board.get(enemySquare);
        if (!enemy) continue;

        const attacks = getAttackMoves(position, enemySquare, enforceLegal);
        const moves = attacks.filter(atk => atk.captured?.square == square);

        attackingMoves.push(...moves as ContextualCapture[]);
    }

    return attackingMoves;
}

/**
 * Returns capturing moves that a piece can make. In check positions
 * whose turn has been flipped, king captures will be included.
 */
export function getAttackMoves(
    position: Chess,
    square: Square,
    enforceLegal = true
) {
    const piece = position.board.get(square);
    if (!piece) throw new Error("no piece found.");

    position = position.clone();
    position.turn = piece.color;

    const enemies = position.board[opposite(piece.color)];
    const epSquare = piece.role == "pawn" && position.epSquare;

    // Get all capturing squares
    let victims = attacks(piece, square, position.board.occupied)
        .intersect(epSquare ? enemies.with(epSquare) : enemies);

    if (enforceLegal)
        victims = victims.intersect(position.dests(square));

    const attackingMoves: ContextualCapture[] = [];

    // Generate legal moves and, if necessary, all promotions
    for (const victimSquare of victims) {
        const move: NormalMove = { from: square, to: victimSquare };

        if (isPromotion(position, move)) {
            PROMOTABLE_ROLES.forEach(role => attackingMoves.push(
                contextualizeMove(
                    position,
                    { ...move, promotion: role },
                    enforceLegal
                ) as ContextualCapture
            ));
        } else {
            attackingMoves.push(contextualizeMove(
                position, move, enforceLegal
            ) as ContextualCapture);
        }
    }

    return attackingMoves;
}

/**
 * Returns the amount of material to be won by exchanging on a
 * given square. A negative number denotes material loss. Where
 * `square` may be captured by en passant, the exchange square
 * may move to the destination of the en passant move.
 * @param promoted If it is known that the piece at `square` was
 * just promoted. If so, it will be treated as worth a pawn.
 */
export function evaluateExchange(
    position: Chess,
    square: Square,
    promoted?: boolean
) {
    position = position.clone();
    if (!SquareSet.backranks().has(square)) promoted = false;

    const see = (square: Square, promoted = false): number => {
        const victim = position.board.get(square);
        if (!victim) throw new Error("no piece to capture.");

        const lvaMove = minBy(
            getAttackerMoves(position, square),
            move => PIECE_VALUES[move.piece.role]
        );
        if (!lvaMove) return 0;

        position.play(lvaMove);

        return (promoted
            ? PIECE_VALUES["pawn"]
            : PIECE_VALUES[victim.role]
        ) - see(lvaMove.to, !!lvaMove.promotion);
    };

    return see(square, promoted);
}

/** Returns whether a piece can be taken for free. */
export function isPieceHanging(position: Chess, square: Square) {
    return evaluateExchange(position, square) > 0;
}