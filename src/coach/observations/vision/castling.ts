import { Chess, opposite, Square } from "chessops";

import { Observation } from "@/coach";

function canCastle(position: Chess, king: Square) {
    return position.dests(king)
        .intersect(position.board[position.turn])
        .intersect(position.board.rook)
        .nonEmpty();
}

export const castling: Observation = ctx => {
    if (!ctx.move) return null;

    const positionCopy = ctx.position.clone();
    positionCopy.turn = opposite(positionCopy.turn);

    const king = positionCopy.board.kingOf(positionCopy.turn);
    if (!king) return null;

    const beforeCastling = canCastle(ctx.move.lastPosition, king);
    const castling = canCastle(positionCopy, king);

    return (!beforeCastling && castling)
        ? `This move allows ${positionCopy.turn} to castle on the next move.`
        : null;
};