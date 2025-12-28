import { NormalMove } from "chessops";

/**
 * A collection of facts about a position, and or the last move that
 * resulted in it, e.g. This move develops a piece; in this position,
 * White has more material.
 */
export class PositionStatements {
    /** The most recently played move in the position. */
    readonly lastMove: NormalMove;

    /** The FEN position for which statements were generated. */
    readonly position: string;

    constructor(position: string, lastMove: NormalMove) {
        this.position = position;
        this.lastMove = lastMove;
    }
}