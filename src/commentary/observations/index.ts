import { Observation } from "../types/assessment/observation";

import { attacksPressure } from "./vision/attacks-pressure";
import { centralControl } from "./vision/central-control";
import { castling } from "./vision/castling";
import { defense } from "./vision/defense";
import { pins } from "./vision/pins";
import { scope } from "./vision/scope";

import { gameStages } from "./game-stages";
import { pieceDevelopment } from "./piece-development";
import { earlyQueen } from "./early-queen";

export const DEFAULT_OBSERVATIONS: Observation[] = [
    // Vision
    attacksPressure,
    centralControl,
    castling,
    defense,
    pins,
    scope,

    // Generic
    gameStages,
    pieceDevelopment,
    earlyQueen
];