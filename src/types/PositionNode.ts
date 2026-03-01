import { INITIAL_FEN } from "chessops/fen";

import { EngineLine } from "@/engine";
import { ContextualMove } from "./ContextualMove";

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
}

export interface AnalysedPositionNode extends PositionNode {
    /** A set of engine lines for this position. */
    engineLines: EngineLine[];
    /** Results from the openings database for this position. */
    database?: {};
}

export const defaultPositionNode: PositionNode = {
    children: [],
    fen: INITIAL_FEN,
    isMainline: true
};