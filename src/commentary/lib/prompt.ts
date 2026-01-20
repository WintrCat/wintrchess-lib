import { makeSan } from "chessops/san";

import { PromptOptions } from "../types/ExplanationOptions";
import { AssessmentNode } from "../types/assessment/node";
import { getAssessmentNodeChain } from "./assessment-node";

const promptTemplate = `
    Below, I have provided several sections describing chess moves or move
    sequences. All sections begin from the same root position. The title of
    each section is the exact move or move sequence being described. The
    bullet points beneath each title contain the only information available
    about that move or the position it results in. Exactly one section
    corresponds to the primary continuation. You must not explicitly state
    that it was the move played, but you must begin your explanation by
    explaining that section first. Afterward, explain the other sections as
    alternative continuations or responses, using only the information given.
    You may omit less important statements in favor of more important ones,
    but you MUST NOT introduce any new chess facts, evaluations, motivations,
    or consequences beyond what is explicitly stated in the bullet points. Do
    not infer additional theory, tactics, or ideas. Speak in second person.
    Do not mention players or that a move was played. The response must be a
    single explanation, with no formatting, headings, or bullet points, and
    nothing besides the explanation itself should be included in the
    response. Whenever you reference a move, you must replace it with the
    full sequence of moves (the title minus any metadata enclosed in
    parentheses) enclosed in double curly braces, e.g. Bc4 (white move) ->
    {{Nc6 Bc4}}. Stylistic expressiveness (such as emojis, interjections, or
    tone markers) is permitted if it is natural to the specified personality.
`;

/** Builds only the introductory brief for a commentary prompt. */
export function buildPromptTemplate(opts?: PromptOptions) {
    let prompt = promptTemplate
        .replace(/ {2,}/g, "")
        .replace(/\n/g, " ")
        .trim();

    if (opts?.personality) prompt += (
        "\nGive your response in the "
        + `personality of ${opts.personality}.`
    );

    if (opts?.additionalPrompt)
        prompt += "\n" + opts.additionalPrompt;

    return prompt + "\n\n";
}

/** Given an assessment, builds a commentary prompt for an LLM. */
export function buildPrompt(
    rootNode: AssessmentNode,
    opts?: PromptOptions
) {
    let prompt = buildPromptTemplate(opts);

    const buildNode = (node: AssessmentNode) => {
        const nodeChain = getAssessmentNodeChain(node, true);

        const moves = nodeChain.map(node => {
            const move = node.context.move!;
            return makeSan(move.lastPosition, move);
        }).join(" ");

        const moveColour = node.context.move?.lastPosition.turn;
        const movesMetadata = ` (${moveColour} move)`
            + (node.isSource ? " (This was the move played)" : "");

        const results = node.results
            .map(result => `- ${result.statement}`)
            .join("\n");

        prompt += `${moves}${movesMetadata}\n${results}\n\n`;

        for (const child of node.children) {
            buildNode(child);
        }
    };

    buildNode(rootNode);
    return prompt.trim();
}