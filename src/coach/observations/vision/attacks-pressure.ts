import { differenceWith, minBy } from "es-toolkit";

import {
    getAttackers,
    getDefenders,
    isHanging,
    SquareSet,
    PIECE_VALUES
} from "@/utils";
import { Observation, pieceLabel } from "@/coach";

export const attacksPressure: Observation = ctx => {
    if (!ctx.move) return null;
    const statements: string[] = [];

    // Attacks that the moved piece makes that it didn't last move
    const newAttacks = differenceWith(
        ctx.move.attackMoves,
        ctx.move.lastAttackMoves,
        (a, b) => a.captured.square == b.captured.square
    );

    for (const attack of newAttacks) {
        if (attack.captured.role == "king") continue;

        // Defenders of the attacked piece
        const defenders = getDefenders(ctx.position, attack.to);

        // Whether the attacked piece was already hanging
        const victimHanging = {
            before: isHanging(ctx.move.lastPosition, attack.to),
            after: isHanging(ctx.position, attack.to)
        };

        let verb = "", attackersComment = "";

        if (!victimHanging.before && victimHanging.after) {
            verb = "attacks";

            const attackers = getAttackers(ctx.position, attack.to)
                .map(atk => pieceLabel(atk));

            if (attackers.length == 2) {
                attackersComment = ` with the ${attackers.join(" and ")}`;
            } else if (attackers.length > 2) {
                attackersComment = ` with ${attackers.length} pieces`;
            }
        } else if (SquareSet.mainland().has(attack.to)) {
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

        // If only defender of attacked piece is its king
        const kingDefender = (
            defenders.length == 1
            && defenders[0]?.role == "king"
        ) ? (
            ", which is only defended by the "
            + `${pieceLabel(defenders[0])} and could be weak`
        ) : "";

        if (verb) statements.push(
            `This move ${verb} the ${pieceLabel(attack.captured, true)}`
            + `${attackersComment}${kingDefender}.`
        );
    }

    return statements;
};