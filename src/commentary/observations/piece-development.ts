import { getAttackMoves, isDevelopingMove, isUndevelopingMove } from "@/utils";
import { LocatedPiece } from "@/types";
import { Observation } from "../types/assessment/observation";
import { pieceLabel } from "../lib/names";

export const pieceDevelopment: Observation = ctx => {
    if (!ctx.move) return null;
    
    if (isDevelopingMove(ctx.move)) {
        const activityStatement = (
            ctx.move.attackMoves.length
            > ctx.move.lastAttackMoves.length
        ) ? " to a more active square" : "";

        const locatedPiece: LocatedPiece = {
            ...ctx.move.piece, square: ctx.move.to
        };

        return (
            `This move develops a ${pieceLabel(locatedPiece)}`
            + `${activityStatement}.`
        );
    }

    if (isUndevelopingMove(ctx.move))
        return `This move undevelops a ${ctx.move.piece.role}.`;

    return null;
};