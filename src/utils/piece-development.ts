import { NormalMove, Chess, SquareSet } from "chessops";

import { getGameStage } from "./game-stage";

/**
 * Returns whether the move puts a piece off of its starting square
 * during the opening stage of the game.
 */
export function isDevelopingMove(position: Chess, move: NormalMove) {
    const fromStarting = SquareSet.backranks().has(move.from);
    const gameStage = getGameStage(position.board);

    return fromStarting && gameStage == "opening";
}

/**
 * The reverse of a developing move; if a piece is moved to their
 * backrank in the opening stage of the game.
 */
export function isUndevelopingMove(position: Chess, move: NormalMove) {
    const piece = position.board.get(move.from);
    if (!piece) throw new Error("move from square has no piece.");

    const toBackrank = SquareSet.backrank(piece.color).has(move.to);
    const gameStage = getGameStage(position.board);

    return toBackrank && gameStage == "opening";
}