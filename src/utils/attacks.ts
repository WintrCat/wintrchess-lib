import {
    Chess,
    NormalMove,
    Role,
    Square,
    SquareSet,
    attacks,
    kingAttacks,
    opposite
} from "chessops";
import { minBy, uniqWith } from "es-toolkit";

import { contextualizeMove, ContextualCapture, LocatedPiece } from "@/types";
import { isPromotion } from "./pawns";

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
    const attackerMoves: ContextualCapture[] = [];

    for (const enemySquare of enemies) {
        const enemy = position.board.get(enemySquare);
        if (!enemy) continue;

        const attacks = getAttackMoves(position, enemySquare, enforceLegal);
        const moves = attacks.filter(atk => atk.captured?.square == square);

        attackerMoves.push(...moves as ContextualCapture[]);
    }

    return attackerMoves;
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
 * Returns the attackers of a piece on `square`.
 * @param opts.enforceLegal Whether to enforce legal moves e.g.
 * do not count pinned pieces as attackers.
 * @param opts.xray Whether to transitively count pieces inside
 * batteries as attackers.
 */
export function getAttackers(
    position: Chess,
    square: Square,
    opts?: {
        enforceLegal?: boolean;
        xray?: boolean;
    }
): LocatedPiece[] {
    position = position.clone();

    const piece = position.board.get(square);
    if (!piece) return [];

    position.turn = opposite(piece.color);

    const attackers: LocatedPiece[] = uniqWith(
        getAttackerMoves(position, square, opts?.enforceLegal),
        (a, b) => a.from == b.from
    ).map(move => ({ ...move.piece, square: move.from }));

    if (opts?.xray && attackers.length > 0) {
        for (const attacker of attackers) {
            if (attacker.role == "king") continue;
            position.board.take(attacker.square);
        }

        attackers.push(...getAttackers(position, square, opts));
    }
    
    // Add King defender if it was not added due to illegal capture
    const allyKing = position.board.kingOf(position.turn);
    const needsKingDefender = allyKing != undefined
        && !attackers.some(atk => atk.role == "king")
        && kingAttacks(allyKing).has(square);

    if (needsKingDefender) attackers.push({
        color: piece.color,
        role: "king",
        square: allyKing
    });

    return attackers;
}

/**
 * Returns the defenders of a piece on `square`.
 * @param opts.enforceLegal Whether to enforce legal moves e.g.
 * do not count pinned pieces as defenders.
 * @param opts.xray Whether to transitively count pieces inside
 * batteries as defenders.
 */
export function getDefenders(
    position: Chess,
    square: Square,
    opts?: {
        enforceLegal?: boolean;
        xray?: boolean;
    }
): LocatedPiece[] {
    position = position.clone();

    const piece = position.board.get(square);
    if (!piece) return [];

    position.board.set(square, { ...piece, color: opposite(piece.color) });

    return getAttackers(position, square, opts);
}

/**
 * Returns the amount of material to be won by exchanging on a given square
 * at least once with the least valuable attacker. A negative number denotes
 * material loss. Where `square` may be captured by en passant, the exchange
 * square may move to the destination of the en passant move.
 * @param opts.enforceLegal If exchanging moves should be validated for
 * legality i.e disallow pinned pieces to exchange.
 * @param opts.promoted If it is known that the piece at `square` was
 * just promoted. If so, it will be treated as worth a pawn.
 */
export function evaluateExchange(
    position: Chess,
    square: Square,
    opts?: {
        enforceLegal?: boolean;
        promoted?: boolean;
    }
) {
    position = position.clone();

    const see = (square: Square, promoted = false, root = true): number => {
        const victim = position.board.get(square);
        if (!victim) throw new Error("no piece to capture.");

        const lvaMove = minBy(
            getAttackerMoves(position, square, opts?.enforceLegal),
            move => PIECE_VALUES[move.piece.role]
        );
        if (!lvaMove) return 0;

        position.play(lvaMove);

        const value = PIECE_VALUES[promoted ? "pawn" : victim.role]
            - see(lvaMove.to, !!lvaMove.promotion, false);

        return root ? value : Math.max(0, value);
    };

    const promoted = SquareSet.backranks().has(square)
        ? opts?.promoted : false;
        
    return see(square, promoted);
}

/**
 * Returns whether the opponent can exchange on this square at least
 * once for a material gain of at least 1.
 */
export function isHanging(...args: Parameters<typeof evaluateExchange>) {
    return evaluateExchange(...args) > 0;
}