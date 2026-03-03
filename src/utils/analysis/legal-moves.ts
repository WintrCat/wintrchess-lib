import { Chess, NormalMove, Role } from "chessops";

import { contextualizeMove } from "@/types";
import { isPromotion } from "../pawns";

const PROMOTABLE_ROLES: Role[] = ["knight", "bishop", "rook", "queen"];

/** Generates all legal moves in a position. */
export function* getLegalMoves(position: Chess) {
    for (const [source, dests] of position.allDests().entries()) {
        for (const dest of dests) {
            yield* unfoldMove(position, { from: source, to: dest });
        }
    }
}

/** Returns whether a position has a certain number of legal moves. */
export function hasLegalMoveCount(position: Chess, count: number) {
    return getLegalMoves(position).take(count).toArray().length == count;
}

/**
 * Unfold a move into all of its possible promotions. If the move is not
 * a promotion, this just returns a list with the given move in it.
 */
export function unfoldMove(position: Chess, move: NormalMove) {
    const ctxMove = contextualizeMove(position, move);

    return isPromotion(position, move)
        ? PROMOTABLE_ROLES.map(promotion => ({ ...ctxMove, promotion }))
        : [ctxMove];
}