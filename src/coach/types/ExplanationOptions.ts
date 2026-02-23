import { ResponsesModel } from "openai/resources";

export interface PromptOptions {
    /** The personality of the explanation. e.g. Peter Griffin */
    personality?: string;
    /** Any additional information to be appended to the prompt. */
    additionalPrompt?: string;
}

export interface ExplanationOptions extends PromptOptions {
    /** The language model to be used. */
    model: ResponsesModel;
    /** The temperature option for the LLM. */
    temperature?: number;
}