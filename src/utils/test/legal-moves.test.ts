import { expect, test } from "vitest";

import { chessFromFen } from "../fen";
import { hasLegalMoveCount } from "../analysis/legal-moves";

test("starting position has 20 legal moves", () => {
    const position = chessFromFen(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );

    expect(hasLegalMoveCount(position, 20)).toBe(true);
    expect(hasLegalMoveCount(position, 1)).toBe(false);
});

test("checkmate position has zero legal moves", () => {
    const position = chessFromFen("7k/6Q1/6K1/8/8/8/8/8 b - - 0 1");

    expect(hasLegalMoveCount(position, 0)).toBe(true);
    expect(hasLegalMoveCount(position, 1)).toBe(false);
});
import { expect, test } from "vitest";

import { chessFromFen } from "../fen";
import { hasLegalMoveCount } from "../analysis/legal-moves";

test("starting position has 20 legal moves", () => {
    const position = chessFromFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

    expect(hasLegalMoveCount(position, 20)).toBe(true);
    expect(hasLegalMoveCount(position, 1)).toBe(false);
});

test("checkmate position has zero legal moves", () => {
    const position = chessFromFen("7k/6Q1/6K1/8/8/8/8/8 b - - 0 1");

    expect(hasLegalMoveCount(position, 0)).toBe(true);
    expect(hasLegalMoveCount(position, 1)).toBe(false);
});
