import { SquareSet, Color, parseSquare } from "chessops";

function colouredSet(white: SquareSet, black: SquareSet, chosen?: Color) {
    if (!chosen) return white.union(black);
    return chosen == "white" ? white : black;
}

export function rank(rank: number, colour: Color = "white") {
    return SquareSet.fromRank(colour == "white" ? rank : 7 - rank);
}

export function pawnRanks(colour?: Color) {
    return colouredSet(
        SquareSet.fromRank(1),
        SquareSet.fromRank(6),
        colour
    );
}

export function centralRanks() {
    return SquareSet.fromRank(3).union(SquareSet.fromRank(4));
}

export function edgeFiles() {
    return SquareSet.fromFile(0).union(SquareSet.fromFile(7));
}

export function flank(colour?: Color) {
    return colouredSet(
        SquareSet.fromSquare(parseSquare("c4")).with(parseSquare("f4")),
        SquareSet.fromSquare(parseSquare("c5")).with(parseSquare("f5")),
        colour
    );
}

export function center(colour?: Color) {
    return colouredSet(
        SquareSet.center().intersect(SquareSet.fromRank(4)),
        SquareSet.center().intersect(SquareSet.fromRank(3)),
        colour
    );
}

export function mainland() {
    return SquareSet.full().xor(
        SquareSet.backranks().union(pawnRanks())
    );
}

export function fianchetto(colour?: Color) {
    return colouredSet(
        SquareSet.fromSquare(parseSquare("b2")).with(parseSquare("g2")),
        SquareSet.fromSquare(parseSquare("b7")).with(parseSquare("g7")),
        colour
    )
}

export function army(colour?: Color) {
    return colour
        ? SquareSet.backrank(colour).union(pawnRanks(colour))
        : SquareSet.full().xor(mainland());
}