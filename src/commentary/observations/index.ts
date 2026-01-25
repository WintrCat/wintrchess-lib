import { Observation } from "../types/assessment/observation";

import { attacksControl } from "./attacks-control";
import { gameStages } from "./game-stages";
import { pieceDevelopment } from "./piece-development";

export const DEFAULT_OBSERVATIONS: Observation[] = [
    attacksControl,
    gameStages,
    pieceDevelopment
];