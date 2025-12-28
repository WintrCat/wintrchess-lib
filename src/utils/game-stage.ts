import { Board, SquareSet } from "chessops";

import { GameStage } from "./types/GameStage";

/** Returns the stage of the game that the board's position is in. */
export function getGameStage(board: Board): GameStage {
    const pieces = board.occupied.diff(board.pawn);
    const pieceCount = pieces.size();

    if (pieceCount <= 6) return "endgame";

    const whiteBackrank = SquareSet.backrank("white").diff(board.white);
    const blackBackrank = SquareSet.backrank("black").diff(board.black);

    const backrankSparse = whiteBackrank.size() < 4
        || blackBackrank.size() < 4;

    if (pieceCount <= 10 || backrankSparse) return "middlegame";

    return "opening";
}