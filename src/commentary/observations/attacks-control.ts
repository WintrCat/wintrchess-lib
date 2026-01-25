import { getAttackMoves, isPieceHanging } from "@/utils";
import { Observation } from "../types/assessment/observation";
import { makeSquare } from "chessops";

export const attacksControl: Observation = ctx => {
    if (!ctx.move) return null;

    const statements: string[] = [];

    const attacks = getAttackMoves(ctx.position, ctx.move.to);

    for (const attack of attacks) {
        if (attack.captured.role == "king") continue;

        const verb = isPieceHanging(ctx.position, attack.captured.square)
            ? "attacks" : "applies pressure to";

        statements.push(
            `This move ${verb} the ${attack.captured.role}`
            + ` on ${makeSquare(attack.captured.square)}.`
        );
    }

    return statements;
};