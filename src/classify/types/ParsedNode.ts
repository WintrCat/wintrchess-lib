import { Chess } from "chessops"

import { AnalysedMove, ContextualMove } from "@/types"
import { EngineLine, Evaluation } from "@/engine"

export interface ParsedNode {
    /** The position of the analysis node. */
    position: Chess;
    /** The FEN string of `position`. */
    fen: string;
    /** The move that has just been played in this position. */
    move: AnalysedMove;
    /** The Win% loss that `move` incurred. */
    winPercentLoss: number;
    /** Information on the top engine line in this position. */
    top: {
        line: EngineLine,
        move: ContextualMove,
        evaluation: Evaluation,
        sidedEvaluation: Evaluation
    };
    /** Information on the second top engine line in this position. */
    secondTop: {
        line: EngineLine,
        move: ContextualMove,
        evaluation: Evaluation,
        sidedEvaluation: Evaluation
    };
}

export type PreviousParsedNode = (
    Omit<ParsedNode, "move" | "winPercentLoss">
);