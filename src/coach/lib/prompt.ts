import { makeSan } from "chessops/san";
import { capitalize } from "es-toolkit";

import { PromptOptions } from "../types/ExplanationOptions";
import { AssessmentNode } from "../types/assessment/node";
import { getAssessmentNodeChain } from "./assessment-node";

const promptTemplate = `
    You are currently looking at a Chess position. Below, I have provided
    several sections describing the position. I also may have included
    information on the move that has just been played, any alternatives to
    that move, and any responses to any of those moves. Different moves are
    explained in different sections. Compile this information into a coherent
    paragraph, or set of paragraphs for each section. Do NOT include any
    formatting at all in your response besides necessary whitespace. Leave any
    parts enclosed in double curly braces AS IS in the response, as these need
    to be parsed later. Do NOT introduce any new Chess facts, evaluations or
    consequences that cannot be explicitly derived from the provided
    information. Do NOT include anything in your response except for the
    compilation of the sections. You do not need to mention that the move
    that has just been played in this position has been played; this is
    already contextually established.
`;

/** Builds only the introductory brief for a coach prompt. */
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

/** Build the title for a move section in a coach prompt. */
export function buildMoveTitle(node: AssessmentNode) {
    const move = node.context.move;
    if (!move) return "No move, this only describes the position:";

    const colour = capitalize(move.piece.color);
    const san = makeSan(move.lastPosition, move);

    if (node.isSource)
        return `${colour} has just played ${san} in this position:`;

    const sanChain = getAssessmentNodeChain(node, true).map(node => (
        makeSan(node.context.move.lastPosition, node.context.move)
    ));

    if (sanChain.length == 1)
        return `${colour} could have instead played ${sanChain[0]}:`;

    return `After ${sanChain.slice(0, -1).join(", ")}, `
        + `${colour} can play ${sanChain.at(-1)}`;
}

/** Given an assessment, builds a coach prompt for an LLM. */
export function buildPrompt(
    rootNode: AssessmentNode,
    opts?: PromptOptions
) {
    let prompt = buildPromptTemplate(opts);

    const buildNode = (node: AssessmentNode) => {
        const moveTitle = buildMoveTitle(node);

        const statements = (node.statements
            .map(statement => `- ${statement}`)
            .join("\n")
        ) || "- No statements";

        prompt += `${moveTitle}\n${statements}\n\n`;

        for (const child of node.children) {
            buildNode(child);
        }
    };

    buildNode(rootNode);
    return prompt.trim();
}