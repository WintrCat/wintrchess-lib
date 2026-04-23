import { makeSquare, makeUci } from "chessops";

import {
    getAttackerMoves,
    getHangingPieces,
    getLegalMoves,
    withMove,
    isPieceTrapped
} from "@/utils";
import {
    ClassifyContext,
    PreviousClassifyContext
} from "@/classify/types/ClassifyContext";
import { isMoveImportant } from "../important-move";

/**
 * Returns a list of hanging pieces that the existence of which can classify
 * this move as `brilliant`, given a previous and current classify context.
 * Note that this does not take into account the engine's opinion of the
 * move; you must make your own check for whether this is the top move etc.
 */
export function evaluateBrilliantMove(
    prev: PreviousClassifyContext,
    current: ClassifyContext,
    logs = false
) {
    const log = (msg: string) => {
        if (logs) console.log(msg);
        return [];
    };

    log(`testing ${makeUci(current.move)} for brilliant...`);

    if (!isMoveImportant(prev, current))
        return log("move was not considered important");

    // Brilliants cannot leave you in a bad position
    if (current.top.sidedEvaluation.value < 0) {
        const logEval = JSON.stringify(current.top.sidedEvaluation);
        return log(`after move eval is bad: ${logEval}`);
    }

    // Moving a piece to safety cannot be brilliant, even if there are
    // other hanging pieces. This covers moving away from a fork
    const hanging = getHangingPieces(current.position, {
        includedPieces: current.position.board[prev.position.turn],
        minimumMaterialLoss: 2,
        move: current.move
    }).toArray();
    if (hanging.length == 0) return log("no pieces hanging");

    const prevHanging = getHangingPieces(prev.position, {
        includedPieces: prev.position.board[prev.position.turn],
        minimumMaterialLoss: 2
    }).toArray();    
    
    if (hanging.length < prevHanging.length)
        return log("less hanging pieces than before");

    // if taking one of your sacrificed pieces creates a greater or equal
    // threat for the taker, then the move is not brilliant.
    const dangerLevels = hanging.every(sacked => (
        sacked.exchange.initialAttackerMoves.every(attack => {
            const attackPosition = withMove(current.position, attack);

            return getHangingPieces(attackPosition, {
                minimumMaterialLoss: sacked.exchange.evaluation,
                includedPieces: attackPosition.board[attack.piece.color]
            }).take(1).toArray().length > 0;
        })
    ));

    if (dangerLevels) return log(
        "taking any of your hanging pieces"
        + " sacrifices >= for your opponent."
    );

    // If taking any of the mover's hanging pieces all allow mate in 1,
    // this move is not awesome enough for brilliant!
    const allCapturesAllowMate = hanging.every(piece => (
        getAttackerMoves(current.position, piece.square).every(move => {
            const position = withMove(current.position, move);

            return getLegalMoves(position).some(response => (
                withMove(position, response).isCheckmate()
            ));
        })
    ));

    if (allCapturesAllowMate)
        return log("any capture of your hanging pieces allows mate");

    // If all the mover's hanging pieces are trapped anyway, not brilliant
    // If a move is made to untrap a piece, not brilliant
    const prevTrappedPieces = prevHanging.filter(piece => (
        isPieceTrapped(prev.position, piece.square)
    ));

    const trappedPieces = hanging.filter(piece => isPieceTrapped(
        current.position, piece.square, { move: current.move }
    ));

    if (
        trappedPieces.length == hanging.length
        || trappedPieces.length < prevTrappedPieces.length
    ) return log(
        "all hanging pieces are trapped, or there are less"
        + " trapped pieces than in the last position."
    );

    // If the moved piece was trapped (desperado), not brilliant
    const movedPieceTrapped = prevTrappedPieces.some(
        piece => piece.square == current.move.from
    );

    if (movedPieceTrapped)
        return log("piece trapped in the last position.");

    log(`identified ${hanging.length} hanging piece(s):`);
    log(hanging.map(piece => makeSquare(piece.square)).join(", "));

    return hanging;
}

/**
 * Returns whether or not a move can be classified as brilliant, given
 * a previous and current classify context. Note that this does not take
 * into account the engine's opinion of the move; you must make your own
 * check for whether this is the top move etc.
 */
export function isMoveBrilliant(
    ...args: Parameters<typeof evaluateBrilliantMove>
) {
    return evaluateBrilliantMove(...args).length > 0;
}