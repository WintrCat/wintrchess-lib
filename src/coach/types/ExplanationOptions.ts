import { ModelId } from "@openrouter/sdk/types";

export type PromptPerson = "first" | "second" | "third";

export interface PromptOptions {
    /**
     * The grammatical person in which the response should be given.
     * - In the `first` person, the move is explained as if the coach
     * were playing it.
     * - In the `second` person, the move is explained as if *you* were
     * playing it.
     * - In the `third` person, the move is explained from an outside
     * perspective from which the players are not known. 
     */
    person?: PromptPerson;
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