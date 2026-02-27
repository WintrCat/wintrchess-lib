import { attacks } from "chessops";

import { Observation, pieceLabel } from "@/coach";
import { isHanging, rank } from "@/utils";

export const defense: Observation = ({ move, position }) => {
    if (!move) return null;
    const statements: string[] = [];

    const visibleAllies = attacks(
        move.piece, move.to, position.board.occupied
    ).intersect(position.board[move.piece.color]);

    // Pawn moves that solidify the structure
    if (
        move.piece.role == "pawn"
        && rank(2, move.piece.color).has(move.to)
        && visibleAllies.size() > 0
    ) statements.push(
        `This move solidifies ${move.piece.color}'s structure.`
    );

    // Pieces that are defended (no longer hanging) through this move
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

    if (defendedAllies.length > 0) statements.push(
        `This move defends the: ${defendedAllies.join(", ")}.`
    );

    return statements;
};