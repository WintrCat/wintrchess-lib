import { ModelId } from "@openrouter/sdk/types";

export interface PromptOptions {
    /** The personality of the explanation. e.g. Peter Griffin */
    personality?: string;
    /** Any additional information to be appended to the prompt. */
    additionalPrompt?: string;
}

export interface ExplanationOptions extends PromptOptions {
    /** The language model to be used. */
    model: (string & {}) | ModelId;
    /** The temperature option for the LLM. */
    temperature?: number;
    /** Whether to report progress updates via `console.log`. */
    logs?: boolean;
}