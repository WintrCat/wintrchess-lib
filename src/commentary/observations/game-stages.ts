import { GAME_STAGES, GameStage, getGameStage } from "@/utils";
import { Observation } from "../types/assessment/observation";

function stageIndex(stage: GameStage) {
    return GAME_STAGES.indexOf(stage);
}

export const gameStages: Observation = (ctx, lastCtx) => {
    if (!lastCtx) return null;

    const stage = getGameStage(ctx.position.board);
    const lastStage = getGameStage(lastCtx.position.board);

    return stageIndex(stage) > stageIndex(lastStage)
        ? `This move starts the ${stage}.`
        : null;
};