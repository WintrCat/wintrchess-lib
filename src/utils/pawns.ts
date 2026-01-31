import { Chess, NormalMove, opposite } from "chessops";

import { LocatedPiece } from "@/types/LocatedPiece";
import { SquareSet } from "./square-sets";

export function isEnPassant(position: Chess, move: NormalMove) {
    return position.board.get(move.from)?.role == "pawn"
        && move.to == position.epSquare;
}

export function getEnPassantedPawn(
    position: Chess,
    move?: NormalMove
): LocatedPiece | undefined {
    if (!position.epSquare) return;
    if (move && !isEnPassant(position, move)) return;

    return {
        color: opposite(position.turn),
        role: "pawn",
        square: position.epSquare + (position.turn == "white" ? -8 : 8)
    };
}

export function isPromotion(position: Chess, move: NormalMove) {
    const piece = position.board.get(move.from);
    if (piece?.role != "pawn") return false;

    return SquareSet.backrank(opposite(piece.color)).has(move.to);
}