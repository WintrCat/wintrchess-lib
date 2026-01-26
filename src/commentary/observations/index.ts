import { Observation } from "../types/assessment/observation";

import { attacksPressure } from "./vision/attacks-pressure";
import { centralControl } from "./vision/central-control";
import { castling } from "./vision/castling";

import { gameStages } from "./game-stages";
import { pieceDevelopment } from "./piece-development";

export const DEFAULT_OBSERVATIONS: Observation[] = [
    attacksPressure,
    centralControl,
    castling,
    
    gameStages,
    pieceDevelopment
];