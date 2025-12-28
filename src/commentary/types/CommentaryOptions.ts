import { ResponsesModel } from "openai/resources";

export interface CommentaryOptions {
    /**
     * Options for the Chess engine that analyses positions.
     * Note that the chosen engine must speak UCI protocol.
     */
    engine: {
        /** The file path to the Chess engine's executable. */
        path: string;
    };

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