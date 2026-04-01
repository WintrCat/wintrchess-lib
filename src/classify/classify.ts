import { makeBoardFen } from "chessops/fen";
import { makeUci, moveEquals } from "chessops/util";

import { hasLegalMoveCount, openings } from "@/utils";
import { ClassifyOptions } from "./types/ClassifyOptions";
import { Classification, WPL_CLASSIFICATIONS } from "./types/Classification";
import { createClassifyContexts } from "./lib/classify-context";
import { wplClassify } from "./lib/wpl-classify";
import { isMoveMiss } from "./lib/classifications/miss-move";
import { isMoveBrilliant } from "./lib/classifications/brilliant-move";
import { isMoveCritical } from "./lib/classifications/critical-move";

/** Returns a classification for a given move. */
export function classify(opts: ClassifyOptions): Classification {
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

    if (
        !opts.exclude?.has("miss")
        && isMoveMiss(prevCtx, ctx, opts.wplThresholds?.inaccuracy)
    ) return "miss";

    const wplClassification = moveEquals(prevCtx.top.move, ctx.move)
        ? "best" : wplClassify(ctx.winPercentLoss, opts);

    if (wplClassification == "best") {
        if (isMoveBrilliant(prevCtx, ctx, opts?.logs)) return "brilliant";
        if (isMoveCritical(prevCtx, ctx, opts?.logs)) return "critical";
    }

    return wplClassification;
}