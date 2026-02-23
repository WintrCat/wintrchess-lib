import { evaluateExchange, SquareSet } from "@/utils";
import { Observation } from "../types/assessment/observation";

export const earlyQueen: Observation = (ctx, lastCtx) => {
    if (!ctx.move || ctx.stage != "opening") return null;
    if (ctx.move.piece.role != "queen") return null;
    if (!SquareSet.centralRanks().has(ctx.move.to)) return null;

    // Free pawns are not absolved of early queen scolding
    const freePieceTaken = lastCtx?.move?.captured
        ? (evaluateExchange(
            lastCtx.move.lastPosition,
            lastCtx.move.captured.square
        ) < -1)
        : (
            !!ctx.move.captured
            && evaluateExchange(ctx.position, ctx.move.to) > 1
        );
    if (freePieceTaken) return null;

    return "This move brings the queen out early, making"
        + " it potentially susceptible to attack.";
};