import { attacks } from "chessops";

import { Observation } from "@/commentary";
import { isDevelopingMove, SquareSet } from "@/utils";

export const centralControl: Observation = ctx => {
    if (!ctx.move) return null;
    if (!isDevelopingMove(ctx.move, true)) return null;
    const piece = ctx.move.piece;

    const visibleSquares = attacks(
        piece,
        ctx.move.to,
        ctx.position.board.occupied
    );

    const seesCenter = visibleSquares
        .intersect(SquareSet.center(piece.color))
        .nonEmpty();

    // If the move does not fight for the center
    const influencesNothing = visibleSquares
        .intersect(ctx.position.board.occupied)
        .isEmpty();
    
    if (!seesCenter) return influencesNothing
        ? "This move does not fight for the center."
        : null;

    // If the move fights for the center
    let statement = `This move adds to ${piece.color}'s`
        + " control of the center";

    // For flank pawn control
    if (piece.role == "pawn" && SquareSet.flank().has(ctx.move.to))
        statement += " with a flank pawn";

    // For distant fianchetto control
    if (piece.role == "bishop" && SquareSet.fianchetto().has(ctx.move.to))
        statement += " from a distance";

    return `${statement}.`;
};