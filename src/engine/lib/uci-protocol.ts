import { UCIValue } from "../types/uci";
import { Evaluation } from "../types/Evaluation";

export function getUCIArgument(
    log: string,
    arg: string,
    valueRegex?: string
) {
    const value = valueRegex || ".+?";
    return log.match(`(?:^| )${arg} (${value})(?= |$)`)?.[1];
}

export function makeUCIArguments(
    args: Record<string, UCIValue | undefined>
) {
    let output = "";

    for (const [arg, value] of Object.entries(args)) {
        if (value == undefined) continue;
        output += `${arg} ${value} `;
    }

    return output.trimEnd();
}

export function parseScore(
    score: string | undefined
): Evaluation | undefined {
    // scores look like "cp 123" or "mate 4"
    if (!score) return;
    const parts = score.split(" ");

    const type = parts.at(0);
    if (type != "cp" && type != "mate") return;

    const value = Number(parts.at(1));
    if (isNaN(value)) return;

    return { type, value };
}