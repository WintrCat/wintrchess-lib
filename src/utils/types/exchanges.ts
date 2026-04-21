import { Role, SquareSet } from "chessops";

import { ContextualMove, LocatedPiece } from "@/types";

export type PieceValues = Record<Role, number>;

export interface AttackMovesOptions {
    /**
     * If attacking moves should be validated for legality i.e
     * disallow pinned pieces to capture. Defaults to `true`.
     */
    enforceLegal?: boolean;
    /**
     * If attacking moves that are promotions should be unfolded into
     * several move objects for each promotion type. Defaults to `true`.
     */
    unfold?: boolean;
}

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
     * accounted for when evaluating the exchange. For example, a knight
     * somewhere on the board will not be considered hanging if you have
     * just taken something of equal or greater value somewhere else.
     */
    move?: ContextualMove;
    /**
     * If the first capture with the lowest value attacker should be
     * forced, even if it is better to stand pat. Defaults to `true`.
     */
    forceFirst?: boolean;
    /** Override the default piece values. */
    pieceValueOverrides?: Partial<Omit<PieceValues, "king">>;
    /** Pieces that are not allowed to capture on the exchange square. */
    excludedCapturers?: SquareSet;
}

export interface ExchangeResult {
    /**
     * The amount of material won after exchanging at least once with the
     * least valuable attacker. A negative number denotes material loss.
     */
    evaluation: number;
    /** The pieces that captured on the exchange square at some point. */
    capturers: LocatedPiece[];
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

export interface HangingPiece extends LocatedPiece {
    /** The result from evaluating an exchange on this piece's square. */
    exchange: ExchangeResult;
}