import {
    Chess,
    NormalMove,
    Square,
    attacks,
    kingAttacks,
    opposite
} from "chessops";

import {
    ContextualCapture,
    contextualizeMove,
    LocatedPiece
} from "@/types";
import { AttackMovesOptions } from "../types/exchanges";
import { unfoldMove } from "./legal-moves";

/**
 * Returns capturing moves that a piece can make. In check positions
 * whose turn has been flipped, king captures will be included.
 */
export function getAttackMoves(
    position: Chess,
    square: Square,
    opts?: AttackMovesOptions
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

    if (opts?.enforceLegal ?? true)
        victims = victims.intersect(position.dests(square));

    // Returns all moves from square to victim
    return [...victims].map(victim => {
        const move: NormalMove = { from: square, to: victim };

        return (opts?.unfold ?? true)
            ? unfoldMove(position, move)
            : contextualizeMove(position, move);
    }).flat() as ContextualCapture[];
}

/** Returns moves that would capture this piece. */
export function getAttackerMoves(
    position: Chess,
    square: Square,
    opts?: AttackMovesOptions
) {
    const piece = position.board.get(square);
    if (!piece) throw new Error("no piece found.");

    const enemies = position.board[opposite(piece.color)];

    return [...enemies].map(enemySquare => {
        const enemy = position.board.get(enemySquare);
        if (!enemy) return [];

        return getAttackMoves(position, enemySquare, opts)
            .filter(atk => atk.captured?.square == square);
    }).flat();
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

    const attackers: LocatedPiece[] = getAttackerMoves(
        position, square,
        { enforceLegal: opts?.enforceLegal, unfold: false }
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