import { Chess } from "chessops";
import { boardEquals } from "chessops/board";

import { GAME_STAGES, GameStage, getGameStage } from "@/utils";
import { Observation } from "../types/assessment/observation";

function stageIndex(stage: GameStage) {
    return GAME_STAGES.indexOf(stage);
}

export const gameStages: Observation = ctx => {
    if (!ctx.move) return null;

    const statements: string[] = [];

    if (boardEquals(ctx.move.lastPosition.board, Chess.default().board))
        statements.push("This move begins the game.");

    const stage = getGameStage(ctx.position.board);
    const lastStage = getGameStage(ctx.move.lastPosition.board);

    if (stageIndex(stage) > stageIndex(lastStage))
        statements.push(`This move starts the ${stage}.`);

    return statements;
};