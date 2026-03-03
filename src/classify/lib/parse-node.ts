import { AnalysisNode, contextualizeMove } from "@/types";
import { chessFromFen } from "@/utils";
import { evaluationAs, getTopLine, getWinPercentLoss } from "@/engine";
import { ParsedNode, PreviousParsedNode } from "../types/ParsedNode";

/**
 * Precompute useful information from the current analysis node.
 * Throws errors if information is not available.
 */
export function parseAnalysisNode(
    node: AnalysisNode,
    part: "current"
): ParsedNode;

/**
 * Precompute useful information from the parent of a current analysis
 * node. Throws errors if information is not available.
 */
export function parseAnalysisNode(
    node: AnalysisNode,
    part: "previous"
): PreviousParsedNode;

export function parseAnalysisNode(
    node: AnalysisNode,
    part: "current" | "previous" = "current"
) {
    if (part == "current") {
        if (!node.move)
            throw new Error("node does not have a move to classify.");

        if (!node.parent)
            throw new Error("node must have a parent to compare with.");
    }

    const position = chessFromFen(node.fen);

    const topLine = getTopLine(node.engineLines);
    const topMove = topLine?.moves.at(0);

    const secondTopLine = getTopLine(node.engineLines, 2);
    const secondTopMove = secondTopLine?.moves.at(0);

    const prevTopLine = node.parent && getTopLine(node.parent.engineLines);

    if (
        !topLine
        || !topMove
        || !secondTopLine
        || !secondTopMove
        || (part == "current" && !prevTopLine)
    ) throw new Error("insufficient engine lines provided.");

    return {
        position: position,
        fen: node.fen,
        move: node.move,
        winPercentLoss: node.move && prevTopLine
            && getWinPercentLoss(
                prevTopLine.evaluation,
                topLine.evaluation,
                node.move.piece.color
            ),
        top: {
            line: topLine,
            move: contextualizeMove(position, topMove),
            evaluation: topLine.evaluation,
            sidedEvaluation: evaluationAs(
                topLine.evaluation, position.turn
            )
        },
        secondTop: {
            line: secondTopLine,
            move: contextualizeMove(position, secondTopMove),
            evaluation: secondTopLine.evaluation,
            sidedEvaluation: evaluationAs(
                secondTopLine.evaluation, position.turn
            )
        }
    } satisfies ParsedNode | PreviousParsedNode;
}