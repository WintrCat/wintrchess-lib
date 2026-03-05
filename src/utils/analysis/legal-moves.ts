import { Chess, NormalMove, Role, Square } from "chessops";

import { contextualizeMove } from "@/types";
import { isPromotion } from "../pawns";

const PROMOTABLE_ROLES: Role[] = ["knight", "bishop", "rook", "queen"];

/** Generates all legal moves in a position, or those from a given square. */
export function* getLegalMoves(position: Chess, from?: Square) {
    const destMap = from != undefined
        ? new Map([[from, position.dests(from)]])
        : position.allDests();

    for (const [source, dests] of destMap.entries()) {
        for (const dest of dests) {
            yield* unfoldMove(position, { from: source, to: dest });
        }
    }
}

/** Returns whether a position has a certain number of legal moves. */
export function hasLegalMoveCount(position: Chess, count: number) {
    const enoughMoves = getLegalMoves(position).take(count + 1).toArray();
    return enoughMoves.length == count;
}

/**
 * Unfold a move into all of its possible promotions. If the move is not
 * a promotion, this just returns a list with the given move in it.
 */
export function unfoldMove(
    position: Chess,
    move: Omit<NormalMove, "promotion">
) {
    const ctxMove = contextualizeMove(position, move);

    return isPromotion(position, move)
        ? PROMOTABLE_ROLES.map(promotion => ({ ...ctxMove, promotion }))
        : [ctxMove];
}

/** Creates a copy of a position with a move or list thereof played. */
export function withMove(
    position: Chess,
    moves: NormalMove | NormalMove[]
) {
    position = position.clone();
    
    if (Array.isArray(moves)) {
        for (const move of moves) position.play(move);
    } else {
        position.play(moves);
    }

    return position;
}