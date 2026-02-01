import { parseSquare, Square } from "chessops";

import { LocatedPiece } from "@/types";
import { isDevelopingMove, isUndevelopingMove, SquareSet } from "@/utils";
import { Observation } from "../types/assessment/observation";
import { pieceLabel } from "../lib/names";

const fianchettoPreparations = SquareSet.empty()
    .with(parseSquare("b3"))
    .with(parseSquare("g3"))
    .with(parseSquare("b6"))
    .with(parseSquare("g6"));

const fianchettoBishops: Record<Square, Square> = {
    [parseSquare("b3")]: parseSquare("c1"),
    [parseSquare("g3")]: parseSquare("f1"),
    [parseSquare("b6")]: parseSquare("c8"),
    [parseSquare("g6")]: parseSquare("f8")
};

export const pieceDevelopment: Observation = ctx => {
    if (!ctx.move) return null;
    const statements: string[] = [];

    // Pawn moves that prepare a bishop for fianchetto
    const fctbSquare = fianchettoBishops[ctx.move.to];
    const fianchettoBishop = fctbSquare != undefined
        ? ctx.position.board.get(fctbSquare)
        : undefined;

    if (
        ctx.stage == "opening"
        && ctx.move.piece.role == "pawn"
        && fianchettoPreparations.has(ctx.move.to)
        && fianchettoBishop?.role == "bishop"
    ) statements.push(
        "This move prepares to fianchetto the "
        + `${pieceLabel({ ...fianchettoBishop, square: fctbSquare! })}.`
    );
    
    // Moves that develop a piece
    if (isDevelopingMove(ctx.move)) {
        const edgeKnightStatement = SquareSet.edgeFiles().has(ctx.move.to)
            && ctx.move.piece.role == "knight"
            && " to the edge of the board, where it could be less active";

        const activityStatement = (
            ctx.move.attackMoves.length
            > ctx.move.lastAttackMoves.length
        ) ? " to a more active square" : "";

        const locatedPiece: LocatedPiece = {
            ...ctx.move.piece, square: ctx.move.to
        };

        statements.push(
            `This move develops a ${pieceLabel(locatedPiece)}`
            + `${edgeKnightStatement || activityStatement}.`
        );
    }

    // Moves that undevelop a piece back to the backrank
    if (isUndevelopingMove(ctx.move)) statements.push(
        `This move undevelops a ${ctx.move.piece.role}.`
    );

    return statements;
};