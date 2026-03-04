import { SquareSet } from "chessops";

import { ContextualMove } from "@/types";
import { PieceValues } from "../analysis/attacks";

export interface ExchangeOptions {
    /**
     * If exchanging moves should be validated for legality i.e
     * disallow pinned pieces to exchange. Defaults to `true`.
     */
    enforceLegal?: boolean;
    /**
     * If the move that has just been played in this position is known,
     * it can be used as helpful context. Pieces that have just been
     * promoted are considered worth a pawn, and the existing capture is
     * accounted for when evaluating the exchange.
     */
    move?: ContextualMove;
    /**
     * If the first capture with the lowest value attacker should be
     * forced, even if it is better to stand pat. Defaults to `true`.
     */
    forceFirst?: boolean;
    /** Override the default piece values. */
    pieceValueOverrides?: Omit<PieceValues, "king">;
}

export interface HangingPiecesOptions extends ExchangeOptions {
    /** Select group of pieces to check. */
    includedPieces?: SquareSet;
    /**
     * The minimum amount of material gain achieved by capturing a
     * piece for it to be considered hanging. Defaults to `1`.
     */
    minimumMaterialGain?: number;
}