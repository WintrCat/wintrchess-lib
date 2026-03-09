import { Square } from "chessops";

import { parsePieceLabel, parseSquareLabel } from "./labels";

export type ExplanationToken =
    | { type: "square", square: Square }
    | { type: "piece" } & NonNullable<ReturnType<typeof parsePieceLabel>>
    | { type: "text", text: string };

/**
 * Split a coach explanation into string parts and parsed labels.
 * Also sanitizes various inconsistencies in the LLM response.
 */
export function tokenizeExplanation(explanation: string): ExplanationToken[] {
    return explanation.split(/({{.+?}})/).map(token => {
        const squareLabel = parseSquareLabel(token);
        if (squareLabel != undefined)
            return { type: "square", square: squareLabel };

        const pieceLabel = parsePieceLabel(token);
        if (pieceLabel) return { type: "piece", ...pieceLabel };

        const sanitisedToken = token
            .replaceAll(/({{|}})/g, "")
            .replaceAll(/( |^)[a-h][1-8]( |$)/g, val => val.toLowerCase());

        return { type: "text", text: sanitisedToken };
    });
}