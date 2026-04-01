import { expect, test } from "vitest";
import { NormalMove } from "chessops";
import { parseSan } from "chessops/san";

import { contextualizeMove } from "@/types";
import { chessFromFen } from "@/utils";
import { classify } from "@/classify";
import { Sample, samples } from "./samples";

async function classifyTest({
    fen,
    moveSan,
    lines,
    lastWinPercentLoss
}: Sample) {
    const position = chessFromFen(fen);
    const move = contextualizeMove(
        position,
        parseSan(position, moveSan) as NormalMove
    );

    return classify({
        position, move, lastWinPercentLoss,
        engineLines: lines
    });
}

for (const sample of samples) test(
    `${sample.fen} > ${sample.moveSan} to be ${sample.expected}`,
    async () => expect(await classifyTest(sample)).toBe(sample.expected)
);