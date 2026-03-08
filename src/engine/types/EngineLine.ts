import { ContextualMove } from "@/types";
import { Evaluation } from "./Evaluation";

export interface EngineLine {
    depth: number;
    index: number;
    moves: ContextualMove[];
    evaluation: Evaluation;
}