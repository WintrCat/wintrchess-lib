import { getWinPercent } from "@/engine";
import {
    ClassifyContext,
    PreviousClassifyContext
} from "../types/ClassifyContext";

const WINNING_WP = getWinPercent({ type: "cp", value: 700 });

/**
 * Returns whether a move in the `prev` position would not have been too
 * easy to find, such that it can qualify for `critical` or `brilliant`.
 */
export function isMoveImportant(
    prev: PreviousClassifyContext,
    current: ClassifyContext
) {
    // Moves required to escape check cannot be important
    // Opponent can give a check first, then take a promoted piece on the
    // next turn, which would at that point be considered a sacrifice.
    // The move to escape check could otherwise falsely be brilliant
    if (prev.position.isCheck()) return false;

    // It is not possible to sacrifice more material than you would
    // gain anyway from a queen promotion
    if (current.move.promotion == "queen") return false;

    // If it's still super winning after the played move
    if (getWinPercent(current.top.sidedEvaluation) >= WINNING_WP)
        return false;

    // If it's still winning even if move had not been found
    const winningAnyways = prev.secondTop
        && getWinPercent(prev.secondTop.sidedEvaluation) >= WINNING_WP;
        
    if (winningAnyways) return false;

    return true;
}