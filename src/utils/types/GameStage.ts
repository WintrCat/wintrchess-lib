export const GAME_STAGES = ["opening", "middlegame", "endgame"] as const;

export type GameStage = typeof GAME_STAGES[number];