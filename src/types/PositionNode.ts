import { EngineLine } from "@/engine";
import { ContextualMove } from "./ContextualMove";

type Depth = readonly boolean[];

type LastDepth<C extends Depth> = (
    C extends [...infer Head, infer _Tail] ? Head : never
);

type NextDepth<C extends Depth> = [...C, true];

export interface PositionNode<D extends Depth | null = null> {
    /** The previous position node */
    parent: D extends Depth
        ? (LastDepth<D> extends never
            ? undefined
            : PositionNode<LastDepth<D>>
        )
        : (PositionNode | undefined);
    /** The next position nodes */
    children: PositionNode<D extends Depth ? NextDepth<D> : null>[];
    /** The move that has just been played in this position. */
    move: D extends Depth
        ? (D extends [] ? undefined : ContextualMove)
        : (ContextualMove | undefined);
    /**
     * If this node is the mainline continuation of the parent node.
     * Note that the root node is also considered mainline.
     */
    isMainline: boolean;
    /** The full FEN string for this position. */
    fen: string;
}

export interface AnalysedPositionNode<
    D extends Depth | null = null
> extends PositionNode<D> {
    /** A set of engine lines for this position. */
    engineLines: EngineLine[];
    /** Results from the openings database for this position. */
    database?: {};
}