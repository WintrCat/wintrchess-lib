import {
    Chess,
    NormalMove,
    opposite,
    pawnAttacks,
    SquareSet
} from "chessops";

import { LocatedPiece } from "@/types/LocatedPiece";

/** Returns whether a move is an en passant capture. */
export function isEnPassant(position: Chess, move: NormalMove) {
    const piece = position.board.get(move.from);
    if (!piece) return false;

    return piece.role == "pawn"
        && !position.board.get(move.to)
        && pawnAttacks(piece.color, move.from).has(move.to);
}

/**
 * Returns the captured pawn in an en passant move. If no move is
 * provided, it will attempt to get a pawn from the board's e.p. square.
 */
export function getEnPassantedPawn(
    position: Chess,
    move?: NormalMove
): LocatedPiece | undefined {
    if (move && !isEnPassant(position, move)) return;
    
    const epSquare = position.epSquare || move?.to;
    if (epSquare == undefined) return;

    const passantedPawnSquare = epSquare + (
        position.turn == "white" ? -8 : 8
    );
    
    const passantedPawn = position.board.get(passantedPawnSquare);

    return passantedPawn && {
        ...passantedPawn,
        square: passantedPawnSquare
    };
}

export function isPromotion(position: Chess, move: NormalMove) {
    const piece = position.board.get(move.from);
    if (piece?.role != "pawn") return false;

    return SquareSet.backrank(opposite(piece.color)).has(move.to);
}