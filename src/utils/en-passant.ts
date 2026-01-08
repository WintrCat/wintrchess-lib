import { Chess, NormalMove, opposite } from "chessops";

import { LocatedPiece } from "@/types/LocatedPiece";

export function isEnPassant(position: Chess, move: NormalMove) {
    return position.board.get(move.from)?.role == "pawn"
        && move.to == position.epSquare;
}

export function getEnPassantedPawn(
    position: Chess,
    move: NormalMove
): LocatedPiece | undefined {
    if (!isEnPassant(position, move)) return;

    return {
        color: opposite(position.turn),
        role: "pawn",
        square: move.to + (position.turn == "white" ? 8 : -8)
    };
}