import { SquareSet, parseSquare } from "chessops";

export const pawnRanks = SquareSet.fromRank(1)
    .union(SquareSet.fromRank(6));

export const flankSquares = SquareSet.empty()
    .with(parseSquare("c4"))
    .with(parseSquare("c5"))
    .with(parseSquare("f4"))
    .with(parseSquare("f5"));

export const fianchettoSquares = SquareSet.empty()
    .with(parseSquare("b2"))
    .with(parseSquare("g2"))
    .with(parseSquare("b7"))
    .with(parseSquare("g7"));

/** All the squares between the two armies at the start. */
export const mainlandSquares = SquareSet.full().xor(
    SquareSet.backranks().union(pawnRanks)
);