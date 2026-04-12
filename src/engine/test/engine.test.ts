import { expect, test } from "vitest";

import {
    evaluationAs,
    getCentipawnLoss,
    getTopLine,
    getTopMove,
    getWinPercentLoss,
    EngineLine
} from "@/engine";

const sampleLines: EngineLine[] = [
    {
        depth: 10,
        index: 1,
        moves: [],
        evaluation: { type: "cp", value: 20 }
    },
    {
        depth: 12,
        index: 1,
        moves: [],
        evaluation: { type: "cp", value: 40 }
    },
    {
        depth: 11,
        index: 2,
        moves: [],
        evaluation: { type: "cp", value: 10 }
    }
];

test("getTopLine returns highest depth line per index", () => {
    expect(getTopLine(sampleLines, 1)?.depth).toBe(12);
    expect(getTopLine(sampleLines, 2)?.depth).toBe(11);
});

test("getTopMove returns undefined when no moves in top line", () => {
    expect(getTopMove(sampleLines)).toBeUndefined();
});

test("evaluationAs flips score for black perspective", () => {
    expect(evaluationAs({ type: "cp", value: 90 }, "black").value).toBe(-90);
    expect(evaluationAs({ type: "mate", value: 2 }, "white").value).toBe(2);
});

test("getWinPercentLoss clamps at zero", () => {
    const loss = getWinPercentLoss(
        { type: "cp", value: 50 },
        { type: "cp", value: 100 },
        "white"
    );

    expect(loss).toBe(0);
});

test("getCentipawnLoss handles perspective and cp-only values", () => {
    expect(
        getCentipawnLoss(
            { type: "cp", value: 120 },
            { type: "cp", value: 20 },
            "white"
        )
    ).toBe(100);

    expect(
        getCentipawnLoss(
            { type: "cp", value: -20 },
            { type: "cp", value: -120 },
            "black"
        )
    ).toBe(-100);

    expect(
        getCentipawnLoss(
            { type: "mate", value: 1 },
            { type: "cp", value: 0 },
            "white"
        )
    ).toBeUndefined();
});
