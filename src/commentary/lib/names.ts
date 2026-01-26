import { makeSquare } from "chessops";

import { LocatedPiece } from "@/types";

export function pieceName(piece: LocatedPiece) {
    return `${piece.role} on ${makeSquare(piece.square)}`;
}