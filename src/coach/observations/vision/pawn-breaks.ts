import { bishopAttacks, kingAttacks, opposite, SquareSet } from "chessops";

import { Observation } from "@/coach";
import { center } from "@/utils";

/**
 * A pawn break is defined as a pawn attacking another pawn that
 * is in a group of at least 2 connected pawns.
 */
export const pawnBreaks: Observation = ctx => {
    if (ctx.move?.piece.role != "pawn") return null;

    // Any pawns attacked by the pawn that just moved
    const attackedPawns = ctx.move.attackMoves
        .filter(atk => atk.captured.role == "pawn")
        .map(atk => atk.captured);
    if (attackedPawns.length == 0) return null;

    const allEnemyPawns = ctx.position.board.pawn.intersect(
        ctx.position.board[opposite(ctx.move.piece.color)]
    );

    // Any attacked pawns that are in groups of at least 2 pawns
    const attackedGroupedPawns = attackedPawns.filter(pawn => (
        kingAttacks(pawn.square)
            .intersect(bishopAttacks(pawn.square, SquareSet.empty()))
            .intersect(allEnemyPawns)
            .nonEmpty()
    ));
    if (attackedGroupedPawns.length == 0) return null;

    const centralComment = attackedGroupedPawns.some(pawn => (
        center(ctx.move?.piece.color).has(pawn.square)
    )) ? " in the center" : "";

    return `This move is a pawn break${centralComment}.`;
};