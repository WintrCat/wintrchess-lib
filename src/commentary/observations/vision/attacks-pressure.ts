import { differenceWith, minBy } from "es-toolkit";

import {
    evaluateExchange,
    getAttackers,
    getAttackMoves,
    getDefenders,
    PIECE_VALUES
} from "@/utils";
import { Observation, pieceName } from "@/commentary";

export const attacksPressure: Observation = ctx => {
    if (!ctx.move) return null;

    const statements: string[] = [];

    const newAttacks = differenceWith(
        getAttackMoves(ctx.position, ctx.move.to),
        getAttackMoves(ctx.move.lastPosition, ctx.move.from),
        (a, b) => a.captured.square == b.captured.square
    );

    for (const attack of newAttacks) {
        if (attack.captured.role == "king") continue;

        const defenders = getDefenders(ctx.position, attack.to);

        let verb: string | undefined;

        if (evaluateExchange(ctx.position, attack.to) > 0) {
            verb = "attacks";
        } else {
            // Not defended by a pawn or LVA <= attacked piece value
            // constitutes real pressure being applied to the piece
            const lva = minBy(
                getAttackers(ctx.position, attack.to),
                atk => PIECE_VALUES[atk.role]
            );
            if (!lva) continue;

            const pawnDefended = defenders.some(def => def.role == "pawn");
            const lvaValue = PIECE_VALUES[lva.role];
            const attackedPieceValue = PIECE_VALUES[attack.captured.role];

            if (!pawnDefended || lvaValue <= attackedPieceValue)
                verb = "applies pressure to";
        }

        const kingDefender = (
            defenders.length == 1 && defenders[0]?.role == "king"
        ) ? ", which is only defended by the king and could be weak" : "";

        if (verb) statements.push(
            `This move ${verb} the ${pieceName(attack.captured)}`
            + `${kingDefender}.`
        );
    }

    return statements;
};