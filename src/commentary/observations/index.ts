import { moveEquals } from "chessops/util";

import { isDevelopingMove, isUndevelopingMove } from "@/utils";
import { getTopMove } from "@/engine";
import { Observation } from "../types/assessment/observation";

export const DEFAULT_OBSERVATIONS: Observation[] = [
    // Check the stage of the game
    // ctx => {
    //     const stage = getGameStage(ctx.position.board);
    //     return `This position is in the ${stage} stage of the game.`;
    // },
    // Check if the move develops or undevelops a piece
    ctx => {
        if (!ctx.move) return null;

        if (isDevelopingMove(ctx.move))
            return `This move develops a ${ctx.move.piece.role}.`;

        if (isUndevelopingMove(ctx.move))
            return `This move undevelops a ${ctx.move.piece.role}.`;

        return null;
    },
    // Check if this move was the best move
    (ctx, lastCtx) => {
        if (!lastCtx || !ctx.move) return null;

        const topMove = getTopMove(lastCtx.engineLines);
        if (!topMove) return null;

        return moveEquals(topMove, ctx.move)
            ? "This was the best move in the position."
            : null;
    }
];