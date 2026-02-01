import { Board, boardEquals } from "chessops/board";

import { GAME_STAGES, GameStage } from "@/utils";
import { Observation } from "../types/assessment/observation";

function stageIndex(stage: GameStage) {
    return GAME_STAGES.indexOf(stage);
}

export const gameStages: Observation = (ctx, lastCtx) => {
    if (!lastCtx) return null;
    const statements: string[] = [];

    if (boardEquals(lastCtx.position.board, Board.default()))
        statements.push("This move begins the game.");

    if (stageIndex(ctx.stage) > stageIndex(lastCtx.stage))
        statements.push(`This move starts the ${ctx.stage}.`);

    return statements;
};