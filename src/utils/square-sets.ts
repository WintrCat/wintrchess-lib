import { SquareSet as NativeSquareSet, Color, parseSquare } from "chessops";

function colouredSet(white: SquareSet, black: SquareSet, chosen?: Color) {
    if (!chosen) return white.union(black);
    return chosen == "white" ? white : black;
}

export class SquareSet extends NativeSquareSet {
    /** The 2nd and 7th ranks. */
    static pawnRanks(colour?: Color) {
        return colouredSet(
            SquareSet.fromRank(1),
            SquareSet.fromRank(6),
            colour
        );
    }

    /** The 4th and 5th ranks. */
    static centralRanks() {
        return SquareSet.fromRank(3).union(SquareSet.fromRank(4));
    }

    /** a-file and h-file. */
    static edgeFiles() {
        return SquareSet.fromFile(0).union(SquareSet.fromFile(7));
    }

    /** Flank pawn squares: `c4`, `c5`, `f4`, `f5`. */
    static flank(colour?: Color) {
        return colouredSet(
            SquareSet.fromSquare(parseSquare("c4")).with(parseSquare("f4")),
            SquareSet.fromSquare(parseSquare("c5")).with(parseSquare("f5")),
            colour
        );
    }

    /** Central squares; `d5`, `e5` for white. `d4`, `e4` for black. */
    static center(colour?: Color) {
        return colouredSet(
            NativeSquareSet.center().intersect(SquareSet.fromRank(4)),
            NativeSquareSet.center().intersect(SquareSet.fromRank(3)),
            colour
        );
    }

    /** Fianchetto squares: `b2`, `g2`, `b7`, `g7`. */
    static fianchetto(colour?: Color) {
        return colouredSet(
            SquareSet.fromSquare(parseSquare("b2")).with(parseSquare("g2")),
            SquareSet.fromSquare(parseSquare("b7")).with(parseSquare("g7")),
            colour
        )
    }

    /** All the squares between the two armies at the start. */
    static mainland() {
        return SquareSet.full().xor(
            SquareSet.backranks().union(SquareSet.pawnRanks())
        );
    }
}