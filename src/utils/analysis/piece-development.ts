import { Chess, SquareSet } from "chessops";

import { beforeMove, ContextualMove } from "@/types";
import { getGameStage } from "./game-stage";
import { army } from "../square-sets";

/**
 * Returns whether the move puts a piece off of its starting square
 * during the opening stage of the game.
 */
export function isDevelopingMove(
    position: Chess,
    playedMove: ContextualMove,
    includePawns = false
) {
    if (playedMove.piece.role == "king") return false;
    if (!includePawns && playedMove.piece.role == "pawn") return false;

    const fromHome = army(playedMove.piece.color).has(playedMove.from);
    const gameStage = getGameStage(beforeMove(position, playedMove).board);

    return fromHome && gameStage == "opening";
}

/**
 * The reverse of a developing move; if a piece is moved to their
 * backrank in the opening stage of the game.
 */
export function isUndevelopingMove(
    position: Chess,
    playedMove: ContextualMove
) {
    if (playedMove.piece.role == "king") return false;

    const toBackrank = SquareSet
        .backrank(playedMove.piece.color)
        .has(playedMove.to);
    const gameStage = getGameStage(beforeMove(position, playedMove).board);

    return toBackrank && gameStage == "opening";
}