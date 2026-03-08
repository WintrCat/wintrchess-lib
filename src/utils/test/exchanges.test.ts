import { expect, test } from "vitest";
import { parseSquare } from "chessops";

import { chessFromFen } from "../fen";
import { evaluateExchange } from "../analysis/exchanges";
import { squareSetOf } from "../square-sets";

test((
    "7k/6b1/2n2q2/4p3/3PP3/5N2/1Q6/7K b - - 0 1 > "
    + "0 material to be won on e5"
), ({ task }) => {
    const position = chessFromFen(task.name.split(" > ")[0]!);
    const exchange = evaluateExchange(position, parseSquare("e5"));

    expect(exchange.evaluation).toBe(0);
});

test((
    "7k/6b1/2n2q2/4p3/3PP3/5N2/1Q6/7K b - - 0 1 > "
    + "1 material to be won on d4"
), ({ task }) => {
    const position = chessFromFen(task.name.split(" > ")[0]!);
    const exchange = evaluateExchange(position, parseSquare("d4"));

    expect(exchange.evaluation).toBe(1);
});

test((
    "7k/8/5p2/4r3/2N5/8/8/7K w - - 0 1 > "
    + "2 material to be won on e5"
), ({ task }) => {
    const position = chessFromFen(task.name.split(" > ")[0]!);
    const exchange = evaluateExchange(position, parseSquare("e5"));

    expect(exchange.evaluation).toBe(2);
});

test((
    "7k/8/5p2/4r3/2N2B2/8/8/7K w - - 0 1 > "
    + "3 material to be won on e5"
), ({ task }) => {
    const position = chessFromFen(task.name.split(" > ")[0]!);
    const exchange = evaluateExchange(position, parseSquare("e5"));

    expect(exchange.evaluation).toBe(3);
});

test((
    "7k/8/5p2/4r3/2N2B2/8/8/7K w - - 0 1 > "
    + "7 material to be won on e5, given a rook value of 9"
), ({ task }) => {
    const position = chessFromFen(task.name.split(" > ")[0]!);
    const exchange = evaluateExchange(position, parseSquare("e5"), {
        pieceValueOverrides: { rook: 9 }
    });

    expect(exchange.evaluation).toBe(7);
});

test((
    "7k/6b1/6p1/5n2/8/3Q4/8/7K w - - 0 1 > "
    + "-6 material to be won on f5"
), ({ task }) => {
    const position = chessFromFen(task.name.split(" > ")[0]!);
    const exchange = evaluateExchange(position, parseSquare("f5"));

    expect(exchange.evaluation).toBe(-6);
});

test((
    "7k/6b1/6p1/5n2/8/3Q4/8/7K w - - 0 1 > "
    + "0 material to be won on f5, w/ allowing standing pat"
), ({ task }) => {
    const position = chessFromFen(task.name.split(" > ")[0]!);
    const exchange = evaluateExchange(position, parseSquare("f5"), {
        forceFirst: false
    });

    expect(exchange.evaluation).toBe(0);
});

test((
    "7k/6b1/6p1/5n2/8/3Q4/8/7K w - - 0 1 > "
    + "0 material to be won on f5, if d3 attacker excluded"
), ({ task }) => {
    const position = chessFromFen(task.name.split(" > ")[0]!);
    const exchange = evaluateExchange(position, parseSquare("f5"), {
        excludedCapturers: squareSetOf("d3")
    });

    expect(exchange.evaluation).toBe(0);
});

test((
    "7k/8/2n5/4N3/4P3/8/8/7K b - - 0 1 > "
    + "0 material to be won on e5, given knight taken bishop"
), ({ task }) => {
    const position = chessFromFen(task.name.split(" > ")[0]!);
    const exchange = evaluateExchange(position, parseSquare("e5"), {
        move: {
            from: parseSquare("f3"),
            to: parseSquare("e5"),
            piece: { role: "knight", color: "white" },
            captured: {
                role: "bishop",
                color: "black",
                square: parseSquare("e5")
            }
        }
    });

    expect(exchange.evaluation).toBe(0);
});

test((
    "2rr4/1p3P1P/1k1b4/3npQP1/2p5/2B1P3/P7/6K1 b - - 0 44 > "
    + "-4 material to be won on c8, given unrelated excluded capturer"
), ({ task }) => {
    const position = chessFromFen(task.name.split(" > ")[0]!);
    const exchange = evaluateExchange(position, parseSquare("c8"), {
        excludedCapturers: squareSetOf("c3")
    });

    expect(exchange.evaluation).toBe(-4);
});