import { attacks, Board, Color, parseSquare, ray } from "chessops";
import { difference } from "es-toolkit";

import { Observation, pieceLabel } from "@/commentary";
import { SquareSet } from "@/utils";

function kingLine(colour: Color) {
    const kingSquare = Board.default().kingOf(colour);
    if (kingSquare == undefined) return;

    return ray(kingSquare, colour == "white"
        ? parseSquare("g3") : parseSquare("g6")
    ).without(kingSquare);
}

export const scope: Observation = ctx => {
    if (ctx.move?.piece.role != "pawn") return null;
    if (ctx.stage != "opening") return null;
    const statements: string[] = [];

    // Dangerous pawn moves that open lines to the king
    const king = ctx.position.board.kingOf(ctx.move.piece.color);
    const kingLineSquares = kingLine(ctx.move.piece.color)
        ?.intersect(ctx.position.board.occupied);

    if (
        king == Board.default().kingOf(ctx.move.piece.color)
        && kingLineSquares?.isEmpty()
    ) statements.push("This move opens a dangerous diagonal to the king.");

    // Pawn moves that open up bishops / queens
    const homeSnipers = ctx.position.board.bishopsAndQueens()
        .intersect(SquareSet.backrank(ctx.move.piece.color));

    const lastBoard = ctx.move.lastPosition.board;
    const openedPieces: string[] = [];

    for (const square of homeSnipers) {
        const homeSniper = ctx.position.board.get(square);
        if (!homeSniper) continue;

        const newlySeen = difference(
            [...attacks(homeSniper, square, ctx.position.board.occupied)],
            [...attacks(homeSniper, square, lastBoard.occupied)]
        );

        if (newlySeen.length >= 2)
            openedPieces.push(pieceLabel({ ...homeSniper, square }));
    }

    if (openedPieces.length > 0) statements.push(
        `This move opens up the ${openedPieces.join(" and ")}.`
    );

    return statements;
};