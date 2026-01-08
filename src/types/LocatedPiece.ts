import { Piece } from "chessops";

/** A piece with a location attached. */
export interface LocatedPiece extends Piece {
    square: number;
}