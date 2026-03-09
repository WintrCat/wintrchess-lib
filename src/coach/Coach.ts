import { OpenAI } from "openai";
import { makeFen } from "chessops/fen";

import { beforeMove } from "@/types";
import { getAttackMoves, getGameStage } from "@/utils";
import { Engine, getEvaluation } from "@/engine";
import { classify } from "@/classify";
import { CoachOptions } from "./types/CoachOptions";
import {
    AssessmentContext,
    AssessmentContextResult
} from "./types/assessment/context";
import {
    AssessmentOptions,
    RecursiveAssessmentOptions
} from "./types/assessment/options";
import { AssessmentNode } from "./types/assessment/node";
import {
    ExplanationOptions,
    RawResponseExplanationOptions
} from "./types/ExplanationOptions";
import { buildSystemPrompt, buildUserPrompt } from "./lib/prompt";
import { ExplanationToken, tokenizeExplanation } from "./lib/explanation";
import { DEFAULT_OBSERVATIONS } from "./observations";

export class Coach {
    engine: Engine;
    llm: OpenAI;

    constructor(opts: CoachOptions) {
        this.engine = opts.engine;
        this.llm = new OpenAI(opts.llm);

        this.engine.setOption("MultiPV", 2);
    }

    /**
     * Produce context to be used by observations. Some information
     * requires context from the last position; pass a `lastContext`
     * if you have this on hand, otherwise it can be recalculated.
     */
    async getAssessmentContext(
        opts: Omit<AssessmentOptions, "observations">,
        lastContextCache?: AssessmentContext
    ): Promise<AssessmentContextResult> {
        // Get engine lines
        this.engine.setPosition(opts.position);
        const lines = await this.engine.evaluate(opts.evaluations);

        // Setup a contexts result
        const contexts: AssessmentContextResult = {
            current: {
                position: opts.position,
                engineLines: lines,
                stage: getGameStage(opts.position.board)
            },
            last: opts.move && lastContextCache
        };

        // Generate a last context if a cache is not provided
        if (!opts.move) return contexts;
        const lastPosition = beforeMove(opts.position, opts.move);
        
        contexts.last ??= (await this.getAssessmentContext({
            evaluations: opts.evaluations,
            position: lastPosition
        })).current;
        
        // Get move related context, comparing with the last context
        const lastEvaluation = getEvaluation(contexts.last.engineLines);
        const evaluation = getEvaluation(lines);
        if (!lastEvaluation || !evaluation)
            throw new Error("engine produced invalid or no lines.");

        contexts.current.move = {
            ...opts.move,
            lastPosition: lastPosition,
            lastAttackMoves: getAttackMoves(
                lastPosition, opts.move.from
            ),
            attackMoves: getAttackMoves(opts.position, opts.move.to),
            classification: classify({
                position: lastPosition,
                move: opts.move,
                engineLines: {
                    current: lines,
                    previous: contexts.last.engineLines
                }
            })
        };

        return contexts;
    }

    /**
     * Produce context and execute observations on a position.
     * Context from the last position can be calculated or reused.
     */
    async createAssessment(
        opts: AssessmentOptions,
        nodeOpts?: {
            isSource?: boolean;
            parentNode?: AssessmentNode;
        }
    ): Promise<AssessmentNode> {
        const log = (msg: string) => opts.logs && console.log(msg);

        const startTime = performance.now();
        log(`assessing ${makeFen(opts.position.toSetup())}`);

        // Generate required context for observations
        const contexts = await this.getAssessmentContext(
            opts, nodeOpts?.parentNode?.context
        );

        log("generated current context" + (
            nodeOpts?.parentNode?.context ? "." : " and last context."
        ));

        // Construct node objects with these contexts
        const node: AssessmentNode = {
            parent: nodeOpts?.parentNode,
            children: [],
            isSource: nodeOpts?.isSource ?? true,
            context: contexts.current,
            statements: []
        };

        node.parent ??= contexts.last && {
            children: [node],
            isSource: false,
            context: contexts.last,
            statements: []
        };

        // Execute observations and apply statements to node
        const observations = opts.observations || DEFAULT_OBSERVATIONS;
        const results = observations.map(async (obs, index) => {
            const result = await obs(contexts.current, contexts.last);

            log(
                `executed ${++index} of ${observations.length} `
                + `observations: ${JSON.stringify(result)}`
            );

            return result;
        });

        node.statements = (await Promise.all(results))
            .filter(res => res != null).flat();

        // Report time elapsed and finalise
        const elapsed = (performance.now() - startTime) / 1000;
        log(`assessement complete (${elapsed.toFixed(3)}s)`);

        return node;
    }

    /**
     * Create an assessment on a given position, and recurse into
     * other variations that are deemed relevant. Returns a tree of
     * explored positions and their assessments.
     */
    async createRecursiveAssessment(opts: RecursiveAssessmentOptions) {
        // const rootAssessment = await this.createAssessment(opts);

        throw new Error("not implemented yet.");
    }

    /** Given an assessment, generate a natural language explanation. */
    async createExplanation<Opts extends ExplanationOptions>(
        rootNode: AssessmentNode,
        opts: Opts
    ) {
        const log = (msg: string) => opts.logs && console.log(msg);
        const startTime = performance.now();

        log([
            "generating explanation for root node",
            `\tposition: ${makeFen(rootNode.context.position.toSetup())}`,
            `\tmodel: ${opts.model}`,
            `\tpersonality: ${opts.personality}`
        ].join("\n"));

        const completion = await this.llm.chat.completions.create({
            model: opts.model,
            messages: [{
                role: "system",
                content: buildSystemPrompt(opts)
            }, {
                role: "user",
                content: buildUserPrompt(rootNode)
            }],
            temperature: opts.temperature || 1
        });

        const explanation = completion.choices[0]?.message.content || "";
        if (!explanation) {
            log("failed to generate explanation");
            throw new Error("failed to generate explanation.");
        }

        const elapsed = (performance.now() - startTime) / 1000;
        log(`successfully generated explanation (${elapsed.toFixed(3)}s)`);

        type Result = Opts extends RawResponseExplanationOptions
            ? string : ExplanationToken[];

        return (opts.rawResponse
            ? explanation
            : tokenizeExplanation(explanation)
        ) as Result;
    }
}