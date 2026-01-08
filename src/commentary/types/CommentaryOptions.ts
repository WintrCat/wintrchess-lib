import { ResponsesModel } from "openai/resources";

import { Engine } from "@/engine";

export interface CommentaryOptions {
    /**
     * Options for the Chess engine that analyses positions.
     * Note that the chosen engine must speak UCI protocol.
     */
    engine: Engine;
    /** Options for an openings database to aid analysis. */
    database?: {}
    /** Options for the LLM that produces commentary. */
    llm: {
        /** The base URL that API requests are sent to. */
        baseURL?: string;
        /** The API key for the API that you are using. */
        apiKey: string;
        /** The model you're using. Some suggestions are provided. */
        model?: ResponsesModel;
    };
}