import { SquareSet } from "chessops";

import { ContextualMove } from "@/types";
import { getGameStage } from "./game-stage";

const pawnRanks = SquareSet.fromRank(1).union(SquareSet.fromRank(6));

/**
 * Returns whether the move puts a piece off of its starting square
 * during the opening stage of the game.
 */
export function isDevelopingMove(move: ContextualMove, excludePawns = true) {
    if (move.piece.role == "king") return false;

    const fromStarting = SquareSet.backranks().has(move.from) || (
        !excludePawns
        && move.piece.role == "pawn"
        && pawnRanks.has(move.from)
    );

    const gameStage = getGameStage(move.lastPosition.board);

    return fromStarting && gameStage == "opening";
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