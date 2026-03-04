import {
    Chess,
    Role,
    Square,
    attacks,
    kingAttacks,
    opposite
} from "chessops";
import { minBy, uniqWith } from "es-toolkit";

import { ContextualCapture, LocatedPiece } from "@/types";
import { ExchangeOptions, HangingPiecesOptions } from "../types/options";
import { unfoldMove } from "./legal-moves";

export type PieceValues = Record<Role, number>;

export const PIECE_VALUES: PieceValues = {
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

    // Returns all moves from square to victim
    return [...victims].map(victim => unfoldMove(
        position, { from: square, to: victim }
    )).flat() as ContextualCapture[];
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
 * material loss. Where the piece on `square` may be captured by en passant,
 * the exchange square may move to the destination of the en passant move.
 */
export function evaluateExchange(
    position: Chess,
    square: Square,
    opts?: ExchangeOptions
) {
    position = position.clone();

    const pieceValues = { ...PIECE_VALUES, ...opts?.pieceValueOverrides };

    const see = (
        square: Square,
        move?: ContextualCapture,
        root = true
    ): number => {
        const victim = position.board.get(square);
        if (!victim) return 0;

        const lvaMove = minBy(
            getAttackerMoves(position, square, opts?.enforceLegal),
            move => pieceValues[move.piece.role]
        );
        if (!lvaMove) return 0;

        position.play(lvaMove);

        const value = pieceValues[move?.promotion ? "pawn" : victim.role]
            - ((root && move?.to == square)
                ? pieceValues[move.captured.role] : 0
            )
            - see(lvaMove.to, lvaMove, false);

        const forceFirstCapture = opts?.forceFirst || true;
        return (root && forceFirstCapture) ? value : Math.max(0, value);
    };

    const existingCapture = opts?.move?.captured
        && opts.move as ContextualCapture;
    
    return see(square, existingCapture);
}

/**
 * Returns whether the opponent can exchange on this square at least
 * once for a material gain of at least 1.
 */
export function isHanging(...args: Parameters<typeof evaluateExchange>) {
    return evaluateExchange(...args) > 0;
}

/** Returns hanging pieces on a board. */
export function getHangingPieces(
    position: Chess,
    opts?: HangingPiecesOptions
): LocatedPiece[] {
    return [...(opts?.includedPieces || position.board.occupied)]
        .filter(square => (
            evaluateExchange(position, square, opts)
            >= (opts?.minimumMaterialGain || 1)
        ))
        .map(square => {
            const piece = position.board.get(square);
            return piece && { ...piece, square };
        })
        .filter(square => square != undefined);
}