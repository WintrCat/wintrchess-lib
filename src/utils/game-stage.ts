import { Board, COLORS } from "chessops";

import { SquareSet } from "./square-sets";

export const GAME_STAGES = ["opening", "middlegame", "endgame"] as const;

export type GameStage = typeof GAME_STAGES[number];

/** Returns the stage of the game that the board's position is in. */
export function getGameStage(board: Board): GameStage {
    const pieces = board.occupied.diff(board.pawn);
    const pieceCount = pieces.size();

    if (pieceCount <= 6) return "endgame";
    if (pieceCount <= 10) return "middlegame";
    
    for (const colour of COLORS) {
        const backrank = SquareSet.backrank(colour).intersect(board[colour]);
        if (backrank.size() < 4) return "middlegame";
    }

    return "opening";
}