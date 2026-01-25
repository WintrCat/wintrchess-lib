import { getAttacks, isDevelopingMove, isUndevelopingMove } from "@/utils";
import { Observation } from "../types/assessment/observation";

export const pieceDevelopment: Observation = ctx => {
    if (!ctx.move) return null;

    const beforeAttacks = getAttacks(
        ctx.move.lastPosition, ctx.move.from, false
    );

    const afterAttacks = getAttacks(ctx.position, ctx.move.to, false);
    
    if (isDevelopingMove(ctx.move)) {
        const activityStatement = afterAttacks.size() > beforeAttacks.size()
            ? " to a more active square" : "";

        return (
            `This move develops a ${ctx.move.piece.role}`
            + `${activityStatement}.`
        );
    }

    if (isUndevelopingMove(ctx.move))
        return `This move undevelops a ${ctx.move.piece.role}.`;

    return null;
};