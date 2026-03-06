import { makeBoardFen } from "chessops/fen";
import { makeUci, moveEquals } from "chessops/util";

import { AnalysisNode } from "@/types";
import { hasLegalMoveCount, openings } from "@/utils";
import {
    Classification,
    WPLClassification,
    WPL_CLASSIFICATIONS
} from "./types/Classification";
import { parseAnalysisNode } from "./lib/parse-node";
import { isMoveBrilliant } from "./lib/brilliant-move";
import { isMoveCritical } from "./lib/critical-move";

export interface ClassifyOptions {
    /** Which classifications to exclude from the result. */
    exclude?: Set<Classification>;
    /**
     * The Win% loss thresholds for Win% loss based classifications.
     * Defaults to those on [WintrChess](https://wintrchess.com).
     */
    wplThresholds?: Partial<Record<WPLClassification, number>>;
    /** Whether to output debug logs through `console.log`. */
    logs?: boolean;
}

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

/**
 * Returns a classification for a given node. Does not edit
 * the given move object in-place.
 */
export function classify(
    node: AnalysisNode,
    opts?: ClassifyOptions
): Classification {
    if (!node.parent)
        throw new Error("node must have a parent to compare win% with.");

    const ctx = parseAnalysisNode(node, "current");
    const prevCtx = parseAnalysisNode(node.parent, "previous");

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