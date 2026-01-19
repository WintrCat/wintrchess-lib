import { makeSan } from "chessops/san";

import { PromptOptions } from "../types/ExplanationOptions";
import { AssessmentNode } from "../types/assessment/node";
import { getAssessmentNodeMoves } from "./assessment-node";

const promptTemplate = `
    Below, I have provided some information about some Chess moves. The
    titles of each of the following sections are moves or sets of moves
    that are played upon the same root Chess position. The list beneath
    them contains short statements that describe the move or the position
    it results in. One of the sections describes the move that was played
    during the game. You must not explicitly mention that it is the move
    actually played, but start by explaining that particular move. Combine
    these sections together to produce an explanation: first of the move
    actually played, and then alternatives and responses thereto. You may
    omit information where it is less important than other statements, but
    you CANNOT create any new information outside that explicitly given.
    Speak in second person. Do not mention players or that a move was
    actually played. The response should be a single plaintext explanation,
    with no formatting, titles, or bullet points. Include only the
    explanation part itself in your response. Whenever you reference a
    move in your response, replace it with the full title of the section
    (excluding any metadata) enclosed in double curly braces, e.g., Nf6
    (black move) -> {{Bc4 Nf6}}.
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
        const moves = getAssessmentNodeMoves(node)
            .map(move => makeSan(move.lastPosition, move))
            .join(" ");

        const results = node.results
            .map(result => `- ${result.statement}`)
            .join("\n");

        prompt += `${moves}\n${results}\n\n`;

        for (const child of node.children) {
            buildNode(child);
        }
    };

    buildNode(rootNode);
    return prompt.trim();
}