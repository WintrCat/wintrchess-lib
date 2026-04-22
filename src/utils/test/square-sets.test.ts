import { expect, test } from "vitest";
import { SquareSet } from "chessops";

import { army, squareSetOf, subtract } from "../square-sets";

test("square set of a few things has correct number of squares", () => {
    expect(squareSetOf(
        SquareSet.backranks(),
        SquareSet.center(),
        "b6"
    ).size()).toBe(21);
});

test("subtracting square set from another works correctly", () => {
    expect(subtract(
        SquareSet.backranks(),
        SquareSet.backrank("white")
    ).size()).toBe(8);
});

test("square sets are different when colour is specified", () => {
    expect(army("white").has(0)).toBe(true);
    expect(army("black").has(0)).toBe(false);
});