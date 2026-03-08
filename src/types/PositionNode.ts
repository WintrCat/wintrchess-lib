import { INITIAL_FEN } from "chessops/fen";

import { EngineLine } from "@/engine";
import { ClassifiedMove, ContextualMove } from "./ContextualMove";

export interface PositionNode {
    /** The previous position node */
    parent?: PositionNode;
    /** The next position nodes */
    children: PositionNode[];

    /** The move that has just been played in this position. */
    move?: ContextualMove & Partial<ClassifiedMove>;
    /**
     * If this node is the mainline continuation of the parent node.
     * Note that the root node is also considered mainline.
     */
    isMainline: boolean;
    /** The full FEN string for this position. */
    fen: string;
    /** If this node and its sub-tree is initially visible. */
    visible?: boolean;
    /** A set of engine lines for this position. */
    engineLines?: EngineLine[];
}

export function defaultPositionNode(): PositionNode {
    return {
        children: [],
        fen: INITIAL_FEN,
        isMainline: true,
        engineLines: []
    };
}