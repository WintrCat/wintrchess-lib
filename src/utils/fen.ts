import { Chess } from "chessops";
import { parseFen } from "chessops/fen";

/**
 * Creates a `Chess` object from a FEN string. Will throw an
 * error in the event of any parsing or validation error.
 */
export function chessFromFen(fen: string) {
    return Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
}