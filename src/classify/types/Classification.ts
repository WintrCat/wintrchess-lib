export const CLASSIFICATIONS = [
    "brilliant",
    "critical",
    "best",
    "excellent",
    "okay",
    "inaccuracy",
    "mistake",
    "blunder",
    "theory",
    "forced",
    "risky"
] as const;

export type Classification = typeof CLASSIFICATIONS[number];

export const WPL_CLASSIFICATIONS = [
    "best",
    "excellent",
    "okay",
    "inaccuracy",
    "mistake",
    "blunder"
] as const satisfies Classification[];

export type WPLClassification = typeof WPL_CLASSIFICATIONS[number];