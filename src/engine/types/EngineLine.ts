import { NormalMove } from "chessops";

import { Evaluation } from "./Evaluation";

export interface EngineLine {
    depth: number;
    index: number;
    moves: NormalMove[];
    evaluation: Evaluation;
}