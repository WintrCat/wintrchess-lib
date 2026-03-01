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

/** Returns the captured pawn in an en passant move. */
export function getEnPassantedPawn(
    position: Chess,
    move?: NormalMove
): LocatedPiece | undefined {
    if (move && !isEnPassant(position, move)) return;
    
    const epSquare = position.epSquare || move?.to;
    if (epSquare == undefined) return;

    return {
        color: opposite(position.turn),
        role: "pawn",
        square: epSquare + (position.turn == "white" ? -8 : 8)
    };
}

export function isPromotion(position: Chess, move: NormalMove) {
    const piece = position.board.get(move.from);
    if (piece?.role != "pawn") return false;

    return SquareSet.backrank(opposite(piece.color)).has(move.to);
}