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