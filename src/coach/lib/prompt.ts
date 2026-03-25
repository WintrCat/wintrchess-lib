import { makeSan } from "chessops/san";
import { capitalize } from "es-toolkit";

import { PromptOptions, PromptPerson } from "../types/ExplanationOptions";
import { AssessmentNode } from "../types/assessment/node";
import { getAssessmentNodeChain } from "./assessment-node";

const systemPromptTemplate = `
    You MUST leave any text enclosed in double curly braces AS IS in the
    response, as these need to be parsed later. e.g. {{bishop f4}} <-- DO NOT
    make any changes to this for the final response. You MUST NOT put anything
    that was not explicitly given in double curly braces in the prompt in
    double curly braces. e.g White played Nxe5+ in this position <-- DO NOT
    convert Nxe5+ to {{Nxe5+}}. Do NOT include any formatting at all in your
    response besides necessary whitespace. You are currently looking at a
    Chess position. I will provide you with several sections describing the
    position. I also may include information on the move that has just been
    played, any alternatives to that move, and any responses to any of those
    moves. Different moves are explained in different sections. Compile this
    information into a coherent paragraph, or set of paragraphs for each
    section. Do NOT introduce any new Chess facts, evaluations or consequences
    that are not explicitly stated in the provided information. Do NOT include
    anything in your response except for the compilation of the sections. You
    do not need to mention that the move that has just been played in this
    position has been played; this is already contextually established.
`;

const promptPersonComments: Record<PromptPerson, string> = {
    first: "Give your response from the first grammatical person, "
        + "as if the move played in this position was yours.",
    second: "Give your response from the second grammatical person, "
        + "as if the move played in this position was mine."
        + "You MUST NOT ever say that my opponent or \"Your opponent\" "
        + "was the one that played the move.",
    third: "Give your response from the third grammatical person, "
        + "as if the players are not known and you are looking at moves "
        + "from an external perspective."
};

/** Builds the system prompt for a coach explanation. */
export function buildSystemPrompt(opts?: PromptOptions) {
    let prompt = systemPromptTemplate
        .replace(/ {2,}/g, "")
        .replace(/\n/g, " ")
        .trim();

    prompt += "\n" + promptPersonComments[opts?.person || "third"];

    if (opts?.personality) prompt += (
        "\nGive your response with the "
        + `personality of ${opts.personality}.`
    );

    if (opts?.additionalPrompt)
        prompt += "\n" + opts.additionalPrompt;

    return prompt.trim();
}

function buildMoveTitle(node: AssessmentNode) {
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

/** Given a coach assessment, builds a user prompt for an LLM. */
export function buildUserPrompt(rootNode: AssessmentNode) {
    let prompt = "";

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