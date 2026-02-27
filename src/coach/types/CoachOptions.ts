import { ClientOptions } from "openai";

import { Engine } from "@/engine";

export interface CoachOptions {
    /** Chess engine adapter with which to evaluate positions. */
    engine: Engine;
    /** Options for an openings database to aid analysis. */
    database?: {}
    /** Options for OpenAI API client for LLM that produces explanations. */
    llm?: ClientOptions;
}