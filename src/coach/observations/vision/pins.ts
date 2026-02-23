import { between, Role } from "chessops";
import { differenceWith } from "es-toolkit";

import { Observation, pieceLabel } from "@/coach";
import { evaluateExchange, getAttackMoves } from "@/utils";

// Piece types that cannot pin another piece
const NON_PINNERS: Role[] = ["king", "knight", "pawn"];

export const pins: Observation = ctx => {
    if (!ctx.move) return null;
    if (NON_PINNERS.includes(ctx.move.piece.role)) return null;
    if (ctx.position.isCheck()) return null;

    const statements: string[] = [];
    const position = ctx.position.clone();

    for (const attack of ctx.move.attackMoves) {
        // Attacked piece cannot be able to capture the pinner
        const victimCanCapturePinner = getAttackMoves(position, attack.to)
            .some(atk => atk.to == ctx.move?.to);

        if (victimCanCapturePinner) continue;
        
        // Find a hanging piece behind the pinned piece
        const victim = position.board.take(attack.to);
        if (!victim) continue;
        
        const newAttacks = differenceWith(
            getAttackMoves(position, ctx.move.to),
            ctx.move.attackMoves,
            (a, b) => a.to == b.to
        );

        const hangingPieceBehind = newAttacks.find(newAttack => (
            newAttack.captured.role == "king"
            || evaluateExchange(position, newAttack.to) > 1
        ))?.captured;

        position.board.set(attack.to, victim);
        if (!hangingPieceBehind) continue;

        // Cannot be pinned, if it is not possible for the pinned piece to
        // pseudo-legally move outside of the pin-ray anyway
        const pinnedPieceDests = position.dests(attack.to, {
            ...position.ctx(), king: undefined
        });
        const pinRay = between(ctx.move.to, hangingPieceBehind.square);

        if (pinRay.union(pinnedPieceDests).size() <= pinRay.size()) continue;

        // Add pin statement
        const pinType = hangingPieceBehind.role == "king"
            ? " absolutely " : " relatively ";

        statements.push(
            `This move${pinType}pins the ${pieceLabel(attack.captured, true)}`
            + ` to the ${pieceLabel(hangingPieceBehind)}.`
        );
    }

    return statements;
};