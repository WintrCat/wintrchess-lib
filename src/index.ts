import { Chess, parseSquare, makeSquare } from "chessops";
import { makePgn, parsePgn } from "chessops/pgn";

const chess = Chess.default();

for (const dest of chess.dests(parseSquare("a2"))) {
    console.log(`from: a2 - can go to: ${makeSquare(dest)}`);
}