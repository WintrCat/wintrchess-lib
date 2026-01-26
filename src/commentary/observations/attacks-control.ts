import { makeSquare } from "chessops";
import { differenceWith, minBy } from "es-toolkit";

import {
    getAttackerMoves,
    getAttackMoves,
    getDefenders,
    isPieceHanging,
    PIECE_VALUES
} from "@/utils";
import { Observation } from "../types/assessment/observation";

export const attacksControl: Observation = ctx => {
    if (!ctx.move) return null;

    const statements: string[] = [];

    const newAttacks = differenceWith(
        getAttackMoves(ctx.position, ctx.move.to),
        getAttackMoves(ctx.move.lastPosition, ctx.move.from),
        (a, b) => a.captured.square == b.captured.square
    );

    for (const attack of newAttacks) {
        if (attack.captured.role == "king") continue;

        let verb = "";

        if (isPieceHanging(ctx.position, attack.to)) {
            verb = "attacks";
        } else {
            // Not defended by a pawn or LVA <= attacked piece value
            // constitutes real pressure being applied to the piece
            const lva = minBy(
                getAttackerMoves(ctx.position, attack.to),
                atk => PIECE_VALUES[atk.piece.role]
            );
            if (!lva) continue;

            const pawnDefended = getDefenders(ctx.position, attack.to)
                .some(def => def.role == "pawn");

            const lvaValue = PIECE_VALUES[lva.piece.role];
            const attackedPieceValue = PIECE_VALUES[attack.captured.role];

            if (!pawnDefended || lvaValue <= attackedPieceValue)
                verb = "applies pressure to";
        }

        if (verb) statements.push(
            `This move ${verb} the ${attack.captured.role}`
            + ` on ${makeSquare(attack.captured.square)}.`
        );
    }

    return statements;
};