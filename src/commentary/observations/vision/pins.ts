import { differenceWith } from "es-toolkit";

import { Observation, pieceLabel } from "@/commentary";
import { getAttackMoves, PIECE_VALUES } from "@/utils";

export const pins: Observation = ctx => {
    if (!ctx.move) return null;
    if (ctx.position.isCheck()) return null;

    const position = ctx.position.clone();
    position.turn = ctx.move.piece.color;

    for (const attack of ctx.move.attackMoves) {
        const victim = position.board.take(attack.captured.square);
        if (!victim) continue;

        const newAttacks = differenceWith(
            getAttackMoves(position, ctx.move.to),
            ctx.move.attackMoves,
            (a, b) => a.captured.square == b.captured.square
        );

        const higherValueBehind = newAttacks.find(newAttack => (
            PIECE_VALUES[newAttack.captured.role]
            > PIECE_VALUES[attack.captured.role]
        ));

        const pinType = higherValueBehind?.captured.role == "king"
            ? "absolutely " : "relatively ";

        if (higherValueBehind) return (
            `This move ${pinType}pins the ${pieceLabel(attack.captured, true)}`
            + ` to the ${pieceLabel(higherValueBehind.captured)}.`
        );

        position.board.set(attack.captured.square, victim);
    }

    return null;
};