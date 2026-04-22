import { expect, test } from "vitest";
import { NormalMove, parseSquare, parseUci, SquareName } from "chessops";

import { contextualizeMove } from "@/types";
import { chessFromFen } from "../fen";
import {
    isPieceTrapped,
    TrappedPieceOptions
} from "../analysis/trapped-pieces";

interface Sample extends TrappedPieceOptions {
    fen: string;
    square: SquareName;
    expected: boolean;
}

const samples: Sample[] = [
    {
        fen: "B6r/p2k2b1/nppn2pp/8/3P4/2N5/PPP2PPP/R1B1R1K1 w - - 0 21",
        square: "a8",
        expected: true
    },
    {
        fen: "Nn1k1b1r/p3pppp/1pb2n2/8/3P4/7P/PP1K1PP1/R1B2B1R w - - 0 13",
        square: "a8",
        expected: true
    },
    {
        fen: "2r2b1r/ppkq2p1/nRp2p2/B2ppQ1P/3P4/4P1N1/P3NPP1/5RK1 b - - 0 20",
        square: "b6",
        expected: false,
        move: contextualizeMove(
            chessFromFen("2r2b1r/ppkq2p1/nnp2p2/B2ppQ1P/3P4/4P1N1/P3NPP1/1R3RK1 w - - 4 20"),
            parseUci("b1b6") as NormalMove
        )
    },
    {
        fen: "1k5q/1ppbr1b1/p1np1nB1/P3p1Br/1P2P2p/N1PPQP1P/4N1P1/R4RK1 b - - 0 1",
        square: "h5",
        expected: true
    },
    {
        fen: "1k5q/1ppbr1b1/p1np1nB1/P3p1r1/1P2P2p/N1PPQP1P/4N1P1/R4RK1 w - - 0 2",
        square: "g5",
        expected: false,
        move: contextualizeMove(
            chessFromFen("1k5q/1ppbr1b1/p1np1nB1/P3p1Br/1P2P2p/N1PPQP1P/4N1P1/R4RK1 b - - 0 1"),
            parseUci("h5g5") as NormalMove
        )
    },
    {
        fen: "8/1p4k1/p1nQ1r1p/3P2p1/1P2p3/P1B1P2b/1KP3q1/8 b - - 1 31",
        square: "f6",
        expected: true
    },
    {
        fen: "1k1r2nr/N1pb2pp/1p1p4/P2Pn3/4qp2/2Q1B3/1PP1B1PP/R5KR w - - 1 17",
        square: "e3",
        expected: true
    },
    {
        fen: "1k1r2nr/N1pb2pp/1p1p4/P2Pn3/4qp2/2Q1B3/1PP1B1PP/R5KR w - - 1 17",
        square: "e3",
        expected: false,
        transitiveAttackCheck: false
    },
    {
        fen: "1k1r2nr/N1pb2pp/1p1p4/P2Pn3/4qp2/2Q1B3/1PP1B1PP/R5KR w - - 1 17",
        square: "e3",
        expected: false,
        minimumMaterialLoss: 4
    }
];

for (const sample of samples) {
    const position = chessFromFen(sample.fen);
    const square = parseSquare(sample.square);

    const piece = position.board.getRole(square);
    if (!piece) continue;

    const testTitle = `${sample.fen} > ${piece} on ${sample.square} `
        + `is${sample.expected ? "" : " not"} trapped`;

    test(testTitle, () => expect(
        isPieceTrapped(position, square, sample)
    ).toBe(sample.expected));
}