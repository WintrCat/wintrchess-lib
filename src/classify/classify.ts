import { makeBoardFen } from "chessops/fen";
import { makeUci, moveEquals } from "chessops/util";

import { hasLegalMoveCount, openings } from "@/utils";
import { ClassifyArgs, ClassifyOptions } from "./types/ClassifyOptions";
import {
    Classification,
    WPLClassification,
    WPL_CLASSIFICATIONS
} from "./types/Classification";
import { createClassifyContexts } from "./lib/classify-context";
import { isMoveBrilliant } from "./lib/brilliant-move";
import { isMoveCritical } from "./lib/critical-move";

/** Classify a move based only on Win% loss. */
export function wplClassify(
    winPercentLoss: number,
    opts?: ClassifyOptions
): WPLClassification {
    const thresholds: Record<WPLClassification, number> = {
        best: 0.01,
        excellent: 0.045,
        okay: 0.08,
        inaccuracy: 0.12,
        mistake: 0.22,
        blunder: 1,
        ...opts?.wplThresholds
    };

    for (const classifKey in thresholds) {
        const classif = classifKey as WPLClassification;

        if (opts?.exclude?.has(classif)) continue;
        if (winPercentLoss < thresholds[classif]) return classif;
    }

    return "blunder";
}

/** Returns a classification for a given move. */
export function classify(opts: ClassifyArgs): Classification {
    const { previous: prevCtx, current: ctx } = createClassifyContexts(opts);

    if (opts?.logs) {
        console.log(`current eval: ${JSON.stringify(ctx.top.evaluation)}`);
        console.log(`last eval: ${JSON.stringify(prevCtx.top.evaluation)}`);
        
        console.log(`best alternative move: ${makeUci(prevCtx.top.move)}`);
    }

    // Ensure at least 1 wp-loss classification is included
    if (WPL_CLASSIFICATIONS.every(classif => opts?.exclude?.has(classif)))
        throw new Error("cannot exclude all WPL classifications.");

    if (
        !opts?.exclude?.has("forced")
        && hasLegalMoveCount(ctx.position, 1)
    ) return "forced";

    if (
        !opts?.exclude?.has("theory")
        && openings[makeBoardFen(ctx.position.board)]
    ) return "theory";

    const wplClassification = moveEquals(prevCtx.top.move, ctx.move)
        ? "best" : wplClassify(ctx.winPercentLoss, opts);

    if (wplClassification == "best") {
        if (isMoveBrilliant(prevCtx, ctx, opts?.logs)) return "brilliant";
        if (isMoveCritical(prevCtx, ctx, opts?.logs)) return "critical";
    }

    return wplClassification;
}