import { Chess, NormalMove, opposite, Piece } from "chessops";

import { getEnPassantedPawn, isEnPassant } from "@/utils/pawns";
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

/** A contextual move with a definite capture. */
export interface ContextualCapture extends ContextualMove {
    captured: LocatedPiece;
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

/** Contextualize a move given a position and the move applied to it. */
export function contextualizeMove(
    position: Chess,
    move: NormalMove,
    enforceLegal = true
): ContextualMove {
    if (enforceLegal && !position.isLegal(move))
        throw new Error("illegal move.");

    const piece = position.board.get(move.from);
    if (!piece) throw new Error("piece not found.");

    const destOccupant = position.board.get(move.to);
    const captured = getEnPassantedPawn(position, move)
        || (destOccupant && { ...destOccupant, square: move.to });

    return { ...move, piece, captured };
}

/**
 * Undo a contextual move from a position and return the
 * previous position.
 */
export function beforeMove(
    position: Chess,
    move: ContextualMove
) {
    const copy = position.clone();

    const movedPiece = copy.board.take(move.to);
    if (!movedPiece) return position;

    copy.board.set(move.from, {
        ...movedPiece,
        role: move.promotion ? "pawn" : movedPiece.role
    });

    if (move.captured)
        copy.board.set(move.captured.square, move.captured);

    copy.turn = opposite(copy.turn);

    if (isEnPassant(copy, move)) copy.epSquare = move.to;
    
    return copy;
}