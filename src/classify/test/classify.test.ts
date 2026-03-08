import { expect, test } from "vitest";
import { NormalMove } from "chessops";
import { makeFen } from "chessops/fen";
import { parseSan } from "chessops/san";

import {
    AnalysisNode,
    contextualizeMove,
    defaultAnalysisNode
} from "@/types";
import { chessFromFen, withMove } from "@/utils";
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
    
    const parent: AnalysisNode = {
        ...defaultAnalysisNode(),
        fen: fen,
        engineLines: lines.previous
    };

    const node: AnalysisNode = {
        ...defaultAnalysisNode(),
        parent: parent,
        fen: makeFen(withMove(position, move).toSetup()),
        move: move,
        engineLines: lines.current
    };
    parent.children.push(node);

    return classify(node);
}

for (const { fen, moveSan, expected, lines } of samples) {
    test(`${fen} > ${moveSan} to be ${expected}`, async () => {
        expect(await classifyTest(fen, moveSan, lines)).toBe(expected);
    });
}