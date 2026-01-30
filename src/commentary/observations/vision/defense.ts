import { attacks } from "chessops";

import { Observation, pieceLabel } from "@/commentary";
import { isHanging } from "@/utils";

export const defense: Observation = ({ move, position }) => {
    if (!move) return null;

    const visibleAllies = attacks(
        move.piece, move.to, position.board.occupied
    ).intersect(position.board[move.piece.color]);

    const defendedAllies: string[] = [];

    for (const allySquare of visibleAllies) {
        const ally = position.board.get(allySquare);
        if (!ally) continue;

        const beforeHanging = isHanging(move.lastPosition, allySquare);
        const afterHanging = isHanging(position, allySquare);

        if (beforeHanging && !afterHanging) defendedAllies.push(
            pieceLabel({ ...ally, square: allySquare })
        );
    }

    return defendedAllies.length > 0
        ? `This move defends the: ${defendedAllies.join(", ")}.`
        : null;
};