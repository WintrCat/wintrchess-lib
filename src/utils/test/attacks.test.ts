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

test((
    "4r2k/8/n7/8/8/8/4B3/4K3 w - - 0 1 > "
    + "pinned attacker of a6 only counted when no enforce legal"
), ({ task }) => {
    const position = chessFromFen(task.name.split(" > ")[0]!);

    expect(getAttackers(position, parseSquare("a6"))).toHaveLength(0);
    expect(
        getAttackers(position, parseSquare("a6"), { enforceLegal: false })
    ).toHaveLength(1);
});

test((
    "2r4k/1P6/8/8/8/8/8/K7 w - - 0 1 > "
    + "pawn attacker of back rank c8"
), ({ task }) => {
    const position = chessFromFen(task.name.split(" > ")[0]!);

    expect(getAttackers(position, parseSquare("c8"))).toMatchObject([
        { color: "white", role: "pawn", square: parseSquare("b7") }
    ]);
});

test((
    "2r4k/1P6/8/8/8/8/8/K7 w - - 0 1 > "
    + "promoting attack move defaults to queen when not unfolded"
), ({ task }) => {
    const position = chessFromFen(task.name.split(" > ")[0]!);
    const moves = getAttackMoves(position, parseSquare("b7"), { unfold: false });

    expect(moves).toHaveLength(1);
    expect(moves[0]!.promotion).toBe("queen");
    expect(position.isLegal(moves[0]!)).toBe(true);
});