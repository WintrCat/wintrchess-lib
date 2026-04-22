import {
    SquareSet,
    Color,
    parseSquare,
    Square,
    SquareName
} from "chessops";

import { LocatedPiece } from "@/types";

type Locatable = LocatedPiece | Square | SquareName | SquareSet;

function colouredSet(white: SquareSet, black: SquareSet, chosen?: Color) {
    if (!chosen) return white.union(black);
    return chosen == "white" ? white : black;
}

/**
 * Construct a square set from any locatable thing, list thereof,
 * or from other square sets.
 * 
 * @example
 * squareSetOf("a3", "a4");
 * squareSetOf(SquareSet.backranks(), SquareSet.center(), "b6");
 * squareSetOf("a3", 46, [someLocatedPiece, SquareSet.center()]);
 */
export function squareSetOf(...locations: (Locatable | Locatable[])[]) {
    let result = SquareSet.empty();

    for (const location of locations.flat()) {
        if (typeof location == "number") {
            result = result.with(location);
            continue;
        }

        if (typeof location == "string") {
            result = result.with(parseSquare(location));
            continue;
        }

        if (location instanceof SquareSet) {
            result = result.union(location);
            continue;
        }

        result = result.with(location.square);
    }

    return result;
}

/** Subtracts `b` from `a`. Same as `a xor (a intersect b)`. */
export function subtract(a: SquareSet, b: SquareSet) {
    return a.xor(a.intersect(b));
}

/**
 * Get a particular rank, starting from a given colour's side.
 * The colour defaults to the white side.
 */
export function rank(rank: number, colour: Color = "white") {
    return SquareSet.fromRank(colour == "white" ? rank : 7 - rank);
}

/** Get the starting position ranks with pawns in them. */
export function pawnRanks(colour?: Color) {
    return colouredSet(
        SquareSet.fromRank(1),
        SquareSet.fromRank(6),
        colour
    );
}

/** Get the two central ranks. */
export function centralRanks() {
    return SquareSet.fromRank(3).union(SquareSet.fromRank(4));
}

/** Get the two files on either edge of the board. */
export function edgeFiles() {
    return SquareSet.fromFile(0).union(SquareSet.fromFile(7));
}

/**
 * Get the flank pawn squares. `c4` and `f4` for white, and `c5` and
 * `f5` for black. All of them are returned if no colour is specified.
 */
export function flank(colour?: Color) {
    return colouredSet(
        SquareSet.fromSquare(parseSquare("c4")).with(parseSquare("f4")),
        SquareSet.fromSquare(parseSquare("c5")).with(parseSquare("f5")),
        colour
    );
}

/**
 * The 4 center squares, or only the 2 closest ones to the backrank
 * of a given colour's side.
 */
export function center(colour?: Color) {
    return colouredSet(
        SquareSet.center().intersect(SquareSet.fromRank(4)),
        SquareSet.center().intersect(SquareSet.fromRank(3)),
        colour
    );
}

/** All squares besides the pieces in the starting position. */
export function mainland() {
    return SquareSet.full().xor(
        SquareSet.backranks().union(pawnRanks())
    );
}

/**
 * The fianchetto squares. `b2` and `g2` for white, and `b7` and `g7` for
 * black. All of them are returned if no colour is specified.
 */
export function fianchetto(colour?: Color) {
    return colouredSet(
        SquareSet.fromSquare(parseSquare("b2")).with(parseSquare("g2")),
        SquareSet.fromSquare(parseSquare("b7")).with(parseSquare("g7")),
        colour
    )
}

/** 
 * The pieces in the starting position for a given colour, or for
 * both colours if one is not specified.
 */
export function army(colour?: Color) {
    return colour
        ? SquareSet.backrank(colour).union(pawnRanks(colour))
        : SquareSet.full().xor(mainland());
}