import { Observation, pieceLabel } from "@/coach";
import { isHanging } from "@/utils";

export const undefendedCaptures: Observation = ctx => {
    if (!ctx.move?.captured) return null;

    const capturedHanging = isHanging(
        ctx.move.lastPosition,
        ctx.move.captured.square
    );

    return capturedHanging
        ? `This move took an undefended ${pieceLabel(ctx.move.captured)}.`
        : null;
};