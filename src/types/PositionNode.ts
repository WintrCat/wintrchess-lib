import { INITIAL_FEN } from "chessops/fen";

import { EngineLine } from "@/engine";
import { AnalysedMove, ContextualMove } from "./ContextualMove";

export interface PositionNode {
    /** The previous position node */
    parent?: PositionNode;
    /** The next position nodes */
    children: PositionNode[];

    /** The move that has just been played in this position. */
    move?: ContextualMove;
    /**
     * If this node is the mainline continuation of the parent node.
     * Note that the root node is also considered mainline.
     */
    isMainline: boolean;
    /** The full FEN string for this position. */
    fen: string;
    /** If this node and its sub-tree is initially visible. */
    visible?: boolean;
}

export interface AnalysisNode extends PositionNode {
    /** The previous position node */
    parent?: AnalysisNode;
    /** The next position nodes */
    children: AnalysisNode[];

    /** The move that has just been played in this position. */
    move?: AnalysedMove;
    /** A set of engine lines for this position. */
    engineLines: EngineLine[];
    /** Results from the openings database for this position. */
    database?: {};
}

export function defaultPositionNode(): PositionNode {
    return {
        children: [],
        fen: INITIAL_FEN,
        isMainline: true
    };
}

export function defaultAnalysisNode(): AnalysisNode {
    return {
        ...defaultPositionNode(),
        parent: undefined,
        children: [],
        engineLines: []
    };
}