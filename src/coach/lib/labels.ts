import { makeSquare, parseSquare, Role, ROLES, Square } from "chessops";

import { LocatedPiece } from "@/types";

/** Parseable string for board squares. */
export function squareLabel(square: Square) {
    return `{{square ${makeSquare(square)}}}`;
}

/** Parseable string for pieces */
export function pieceLabel(piece: LocatedPiece, includeSquare = false) {
    const suffix = includeSquare ? " full" : "";
    return `{{${piece.role} ${makeSquare(piece.square)}${suffix}}}`;
}

/** Parse a square label into its square. */
export function parseSquareLabel(label: string) {
    const squareName = label.match(/(?<={{square )[a-h][1-8](?=}})/)?.[0];
    return squareName ? parseSquare(squareName) : undefined;
}

/** Parse a piece label into its piece, square and full description flag. */
export function parsePieceLabel(label: string) {
    const parts = label.match(new RegExp(
        `(?<={{)(${ROLES.join("|")}) ([a-h][1-8])( full)?(?=}})`
    ))?.slice(1);
    if (!parts) return;

    const role = parts[0] as Role | undefined;
    if (!role) return;

    const square = parts[1] ? parseSquare(parts[1]) : undefined;
    if (square == undefined) return;

    return { role, square, full: !!parts[2] };
}