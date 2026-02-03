import { Board, boardEquals } from "chessops/board";
import { makeBoardFen } from "chessops/fen";

import { GAME_STAGES, GameStage, openings } from "@/utils";
import { Observation } from "../types/assessment/observation";

function openingName(fullName: string) {
    const branches = fullName.split(/: |, ?/g);
    const lastBranch = branches.at(-1);
    const penultimateBranch = branches.at(-2);

    const parent = lastBranch?.match(/(^| )Line/gi) && penultimateBranch
        ? ` of the ${penultimateBranch}` : "";

    return lastBranch && `${lastBranch}${parent}`;
}

function stageIndex(stage: GameStage) {
    return GAME_STAGES.indexOf(stage);
}

export const gameStages: Observation = (ctx, lastCtx) => {
    if (!lastCtx) return null;
    const statements: string[] = [];

    const fullOpeningName = openings[makeBoardFen(ctx.position.board)];
    const openingBranchName = fullOpeningName && openingName(fullOpeningName);

    if (openingBranchName) statements.push(
        `This move is called the ${openingBranchName}.`
    );

    if (boardEquals(lastCtx.position.board, Board.default()))
        statements.push("This move begins the game.");

    if (stageIndex(ctx.stage) > stageIndex(lastCtx.stage))
        statements.push(`This move starts the ${ctx.stage}.`);

    return statements;
};