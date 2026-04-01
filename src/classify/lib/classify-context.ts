import { Color } from "chessops";

import { contextualizeMove } from "@/types";
import { withMove } from "@/utils";
import {
    EngineLine,
    evaluationAs,
    getTopLine,
    getWinPercentLoss
} from "@/engine";
import {
    ClassifyContext,
    PreviousClassifyContext,
    ClassifyOptions
} from "@/classify";

interface ClassifyContexts {
    previous: PreviousClassifyContext;
    current: ClassifyContext;
}

function extractLines(moveColour: Color, lines: EngineLine[]) {
    const topLine = getTopLine(lines);
    const topMove = topLine?.moves.at(0);

    const secondTopLine = getTopLine(lines, 2);
    const secondTopMove = secondTopLine?.moves.at(0);

    // TO-DO: pick the top lines that are closest in depth to the
    // ones chosen from the previous lines. an extra argument will
    // be required to provide the last depth.

    if (!topLine || !topMove)
        throw new Error("insufficient engine lines provided.");

    return {
        top: {
            line: topLine,
            move: topMove,
            evaluation: topLine.evaluation,
            sidedEvaluation: evaluationAs(
                topLine.evaluation,
                moveColour
            )
        },
        secondTop: secondTopLine && secondTopMove && {
            line: secondTopLine,
            move: secondTopMove,
            evaluation: secondTopLine.evaluation,
            sidedEvaluation: evaluationAs(
                secondTopLine.evaluation,
                moveColour
            )
        }
    };
}

/**
 * Precompute frequently used information for move classification.
 * Throws errors if insufficient information is provided.
 */
export function createClassifyContexts(
    opts: ClassifyOptions
): ClassifyContexts {
    const move = contextualizeMove(opts.position, opts.move);

    const prevLines = extractLines(
        move.piece.color,
        opts.engineLines.previous
    );

    const currentLines = extractLines(
        move.piece.color,
        opts.engineLines.current
    );

    return {
        previous: {
            position: opts.position,
            winPercentLoss: opts.lastWinPercentLoss,
            ...prevLines
        },
        current: {
            position: withMove(opts.position, move),
            move: move,
            winPercentLoss: getWinPercentLoss(
                prevLines.top.evaluation,
                currentLines.top.evaluation,
                move.piece.color
            ),
            ...currentLines
        }
    };
}