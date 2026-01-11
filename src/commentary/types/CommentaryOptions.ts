import { ClientOptions } from "openai";

import { Engine } from "@/engine";

export interface CommentaryOptions {
    /** Chess engine adapter with which to evaluate positions. */
    engine: Engine;
    /** Options for an openings database to aid analysis. */
    database?: {}
    /** Options for the LLM that produces commentary. */
    llm?: ClientOptions;
}