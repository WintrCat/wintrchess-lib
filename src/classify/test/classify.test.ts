import { expect, test } from "vitest";
import { NormalMove } from "chessops";
import { parseSan } from "chessops/san";

import { contextualizeMove } from "@/types";
import { chessFromFen } from "@/utils";
import { classify } from "@/classify";
import { EngineCache, samples } from "./samples";

async function classifyTest(
    fen: string,
    moveSan: string,
    lines: EngineCache
) {
    const position = chessFromFen(fen);
    const move = contextualizeMove(
        position,
        parseSan(position, moveSan) as NormalMove
    );

    return classify({
        position: position,
        move: move,
        engineLines: lines
    });
}

for (const { fen, moveSan, expected, lines } of samples) {
    test(`${fen} > ${moveSan} to be ${expected}`, async () => {
        expect(await classifyTest(fen, moveSan, lines)).toBe(expected);
    });
}