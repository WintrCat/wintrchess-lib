import { attacks, parseSquare, SquareSet } from "chessops";

import { Observation } from "@/commentary";
import { getGameStage, isDevelopingMove } from "@/utils";

const flankSquares = SquareSet.empty()
    .with(parseSquare("c4"))
    .with(parseSquare("c5"))
    .with(parseSquare("f4"))
    .with(parseSquare("f5"));

const fianchettoSquares = SquareSet.empty()
    .with(parseSquare("b2"))
    .with(parseSquare("g2"))
    .with(parseSquare("b7"))
    .with(parseSquare("g7"));

export const centralControl: Observation = ctx => {
    if (!ctx.move) return null;
    if (!isDevelopingMove(ctx.move)) return null;

    const piece = ctx.move.piece;

    // If it's the opening and a move controls the center
    const openingStage = getGameStage(ctx.position.board) == "opening";

    const seesCenter = attacks(
        ctx.move.piece,
        ctx.move.to,
        ctx.position.board.occupied
    ).intersect(SquareSet.center()).nonEmpty();

    if (!seesCenter || !openingStage) return null;

    let statement = `This move adds to ${ctx.move.piece.color}'s`
        + " control of the center";

    // For flank pawn control
    if (piece.role == "pawn" && flankSquares.has(ctx.move.to))
        statement += " with a flank pawn";

    // For distant fianchetto control
    if (piece.role == "bishop" && fianchettoSquares.has(ctx.move.to))
        statement += " from a distance";

    return `${statement}.`;
};