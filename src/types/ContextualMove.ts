import { Chess, NormalMove, Piece } from "chessops";

import { getEnPassantedPawn } from "@/utils/en-passant";
import { LocatedPiece } from "./LocatedPiece";

/** A move with the context of the position it was played in. */
export interface ContextualMove extends NormalMove {
    /** The piece that was moved. */
    piece: Piece;
    /**
     * The piece, if any, that was captured. Its `square` will 
     * differ from `to` for en passant captures.
     */
    captured?: LocatedPiece;
}

export interface AnalysedMove extends ContextualMove {
    /** e.g. `brilliant`, `blunder`, `theory` etc. */
    // classification: Classification;
    /** Win probability lost as a result of this move. (0-100) */
    winPercentLoss: number;
    /**
     * Centipawns lost as a result of this move.
     * Not defined when a forced mate is involved.
     */
    centipawnLoss?: number;
}

/** Hydrate a move given a position and the move applied to it. */
export function contextualizeMove(
    position: Chess,
    move: NormalMove
): ContextualMove {
    const piece = position.board.get(move.from);
    if (!piece) throw new Error("piece not found to hydrate move.");

    const destOccupant = position.board.get(move.to);
    const captured = getEnPassantedPawn(position, move)
        || (destOccupant && { ...destOccupant, square: move.to });

    return { ...move, piece, captured };
}