import { makeSan } from "chessops/san";

import { PromptOptions } from "../types/ExplanationOptions";
import { AssessmentNode } from "../types/assessment/node";
import {
    getAssessmentNodeChain,
    getAssessmentNodeDepth
} from "./assessment-node";

const promptTemplate = `
    Below, I have provided several sections describing chess moves or move
    sequences. All sections begin from the same root position. The title of
    each section is the exact move or move sequence being described. The
    bullet points beneath each title contain the only information available
    about that move or the position it results in. Exactly one section
    corresponds to the primary continuation. You must not explicitly state
    that it was the move played, but you must begin your explanation by
    explaining that section first. Each section is marked as either a
    response, alternative, or the primary continuation. Explain each of them
    afterwards, using only the information given. If the primary continuation
    is titled "no move" then you must skip explaining that section. If there
    are no other sections, you MUST NOT mention at all that this is the case;
    simply do not mention them. You MUST NOT introduce any new chess facts,
    evaluations, motivations, or consequences beyond what is explicitly stated
    in the bullet points. Do not infer additional theory, tactics, or ideas.
    Speak in third person, referring to moves as "this move" for example. The
    response must be a single explanation, with no formatting, headings, or
    bullet points, and nothing besides the explanation itself should be
    included in the response. Whenever you reference a move, you must replace
    it with the full sequence of moves (the title minus any metadata enclosed
    in parentheses) enclosed in double curly braces, e.g. Bc4 (white move) ->
    {{Nc6 Bc4}}. Whenever you reference a square, you should replace it by the
    following format: f7 -> {{square f7}}. Stylistic expressiveness (such as
    emojis, interjections, or tone markers) is permitted if it is natural to
    the specified personality.
`;

/** Builds only the introductory brief for a commentary prompt. */
export function buildPromptTemplate(opts?: PromptOptions) {
    let prompt = promptTemplate
        .replace(/ {2,}/g, "")
        .replace(/\n/g, " ")
        .trim();

    if (opts?.personality) prompt += (
        "\nGive your response with the "
        + `personality of ${opts.personality}.`
    );

    if (opts?.additionalPrompt)
        prompt += "\n" + opts.additionalPrompt;

    return prompt + "\n\n";
}

/** Build the metadata tags for a move section in a commentary prompt. */
export function buildMoveMetadata(node: AssessmentNode) {
    const metatags: string[] = [];

    const moveColour = node.context.move?.lastPosition.turn;
    if (moveColour) metatags.push(moveColour);

    metatags.push(getAssessmentNodeDepth(node) <= 1
        ? (node.isSource ? "primary continuation" : "alternative")
        : "response"
    );

    return metatags.map(tag => `(${tag})`).join(" ");
}

/** Given an assessment, builds a commentary prompt for an LLM. */
export function buildPrompt(
    rootNode: AssessmentNode,
    opts?: PromptOptions
) {
    let prompt = buildPromptTemplate(opts);

    const buildNode = (node: AssessmentNode) => {
        const nodeChain = getAssessmentNodeChain(node);

        const moves = (nodeChain
            .filter(node => node.context.move)
            .map(node => {
                const move = node.context.move!;
                return makeSan(move.lastPosition, move);
            })
            .join(" ")
        ) || "no move";

        const movesMetadata = buildMoveMetadata(node);

        const statements = (node.statements
            .map(statement => `- ${statement}`)
            .join("\n")
        ) || "- no statements";

        prompt += `${moves} ${movesMetadata}\n${statements}\n\n`;

        for (const child of node.children) {
            buildNode(child);
        }
    };

    buildNode(rootNode);
    return prompt.trim();
}