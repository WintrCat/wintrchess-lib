import { SquareSet } from "chessops";

import { ContextualMove } from "@/types";
import { getGameStage } from "./game-stage";
import { army } from "./square-sets";

/**
 * Returns whether the move puts a piece off of its starting square
 * during the opening stage of the game.
 */
export function isDevelopingMove(move: ContextualMove, includePawns = false) {
    if (move.piece.role == "king") return false;
    if (!includePawns && move.piece.role == "pawn") return false;

    const fromHome = army(move.piece.color).has(move.from);
    const gameStage = getGameStage(move.lastPosition.board);

    return fromHome && gameStage == "opening";
}

/**
 * The reverse of a developing move; if a piece is moved to their
 * backrank in the opening stage of the game.
 */
export function isUndevelopingMove(move: ContextualMove) {
    if (move.piece.role == "king") return false;

    const toBackrank = SquareSet.backrank(move.piece.color).has(move.to);
    const gameStage = getGameStage(move.lastPosition.board);

    return toBackrank && gameStage == "opening";
}