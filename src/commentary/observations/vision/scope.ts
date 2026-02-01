import { attacks } from "chessops";
import { difference } from "es-toolkit";

import { Observation, pieceLabel } from "@/commentary";
import { SquareSet } from "@/utils";

export const scope: Observation = ctx => {
    if (ctx.move?.piece.role != "pawn") return null;
    if (ctx.stage != "opening") return null;

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

    return openedPieces.length > 0
        ? `This move opens up the ${openedPieces.join(" and ")}.`
        : null;
};