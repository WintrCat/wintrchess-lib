import { expect, test } from "vitest";
import { parseSquare } from "chessops";

import { chessFromFen } from "../fen";
import {
    getAttackerMoves,
    getAttackers,
    getAttackMoves,
    getDefenders
} from "../analysis/attacks";

test((
    "7k/8/2n5/4p3/3PP3/5N2/8/7K b - - 0 1 > "
    + "f3 attacks e5"
), ({ task }) => {
    const position = chessFromFen(task.name.split(" > ")[0]!);

    expect(
        getAttackMoves(position, parseSquare("f3")).some(
            move => move.captured.square == parseSquare("e5")
        )
    ).toBe(true);
});

test((
    "7k/8/2n5/4p3/3PP3/5N2/8/7K b - - 0 1 > "
    + "e5 attacked by f3"
), ({ task }) => {
    const position = chessFromFen(task.name.split(" > ")[0]!);

    expect(
        getAttackerMoves(position, parseSquare("e5")).some(
            move => move.from == parseSquare("f3")
        )
    ).toBe(true);
});

test((
    "7k/8/2n5/4p3/3PP3/5N2/1Q6/7K b - - 0 1 > "
    + "2 attackers of e5 (no xray)"
), ({ task }) => {
    const position = chessFromFen(task.name.split(" > ")[0]!);
    expect(getAttackers(position, parseSquare("e5"))).toHaveLength(2);
});

test((
    "7k/8/2n5/4p3/3PP3/5N2/1Q6/7K b - - 0 1 > "
    + "3 attackers of e5 (w/ xray)"
), ({ task }) => {
    const position = chessFromFen(task.name.split(" > ")[0]!);

    expect(
        getAttackers(position, parseSquare("e5"), { xray: true })
    ).toHaveLength(3);
});

test((
    "7k/6b1/2n2q2/4p3/3PP3/5N2/1Q6/7K b - - 0 1 > "
    + "2 defenders of e5 (no xray)"
), ({ task }) => {
    const position = chessFromFen(task.name.split(" > ")[0]!);
    expect(getDefenders(position, parseSquare("e5"))).toHaveLength(2);
});

test((
    "7k/6b1/2n2q2/4p3/3PP3/5N2/1Q6/7K b - - 0 1 > "
    + "3 defenders of e5 (w/ xray)"
), ({ task }) => {
    const position = chessFromFen(task.name.split(" > ")[0]!);
    
    expect(
        getDefenders(position, parseSquare("e5"), { xray: true })
    ).toHaveLength(3);
});

test((
    "7r/p2k2b1/npBn2pp/8/3P4/2N5/PPP2PPP/R1B1R1K1 b - - 0 21 > "
    + "in check, no attacker moves on another piece"
), ({ task }) => {
    const position = chessFromFen(task.name.split(" > ")[0]!);

    expect(getAttackerMoves(
        position,
        parseSquare("d4")
    )).toHaveLength(0);
});

test((
    "7r/p2k2b1/npBn2pp/8/3P4/2N5/PPP2PPP/R1B1R1K1 b - - 0 21 > "
    + "in check, 1 attacker move on another piece when no enforce legal"
), ({ task }) => {
    const position = chessFromFen(task.name.split(" > ")[0]!);

    expect(getAttackerMoves(
        position,
        parseSquare("d4"),
        { enforceLegal: false }
    )).toHaveLength(1);
});