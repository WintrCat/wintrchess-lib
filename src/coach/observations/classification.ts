import { Observation } from "@/coach";
import { Classification } from "@/classify";

const CLASSIF_DESCRIPTIONS: Record<Classification, string> = {
    brilliant: "brilliant",
    critical: "critical",
    best: "the best move in the position",
    excellent: "excellent",
    okay: "okay, but there were better options",
    inaccuracy: "an inaccuracy",
    mistake: "a mistake",
    blunder: "a blunder",
    miss: "a missed win",
    theory: "theory",
    forced: "forced (the only legal move in the position)",
    risky: "risky (good empirical winrates, but objectively bad)"
};

export const classification: Observation = ctx => {
    if (!ctx.move) return null;

    const description = CLASSIF_DESCRIPTIONS[ctx.move.classification];
    return `This move is ${description}.`;
};