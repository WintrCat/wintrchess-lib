import { makeSquare, Square } from "chessops";

import { LocatedPiece } from "@/types";

/** Parseable string for board squares. */
export function squareLabel(square: Square) {
    return `{{square ${makeSquare(square)}}}`;
}

/** Parseable string for pieces */
export function pieceLabel(piece: LocatedPiece, includeSquare = false) {
    const header = includeSquare ? "full" : "piece";
    return `{{${header} ${makeSquare(piece.square)}}}`;
}