import { Chess, NormalMove, parseUci, makeUci } from "chessops";
import { makeFen, parseFen } from "chessops/fen";

import {
    DEFAULT_ENGINE_DEPTH,
    EvaluateOptions
} from "./types/EvaluateOptions";
import { EngineLine } from "./types/EngineLine";
import { UCICommand, UCIOption, UCIValue } from "./types/uci";
import {
    parseScore,
    getUCIArgument,
    makeUCIArguments
} from "./lib/uci-protocol";

export interface EngineEvents {
    /** When the engine emits a UCI command. */
    message: (message: string) => void;
    /** When the engine throws an error. */
    error: (message: string) => void;
};

export abstract class Engine {
    /**
     * Send a UCI command to the engine. Don't use this to set the
     * position, as it must stay in sync with the internal class state.
     */
    abstract sendCommand(command: UCICommand): void;

    /** Attach an event listener to the engine. */
    abstract on<EventType extends keyof EngineEvents>(
        event: EventType, 
        fn: EngineEvents[EventType]
    ): void;

    /** Detach an event listener from the engine. */
    abstract off<EventType extends keyof EngineEvents>(
        event: EventType,
        fn: EngineEvents[EventType]
    ): void;

    /** Terminate the engine, e.g. kill the process. */
    abstract terminate(): void;

    /** Internal board position. */
    position = Chess.default();

    /** Map of event listeners to native ones from the adapter. */
    readonly listeners = new Map<
        EngineEvents[keyof EngineEvents],
        (...args: any[]) => void
    >();
    
    /**
     * Send a UCI command and collect response logs until an
     * end condition is satisfied or a timeout in ms is reached.
     */
    async consumeLogs(
        command: UCICommand,
        endCondition: (logMessage: string) => boolean,
        options?: {
            onLogReceived?: (log: string) => void;
            timeout?: number;
        }
    ): Promise<string[]> {
        return new Promise((res, rej) => {
            this.sendCommand(command);

            const logMessages: string[] = [];

            const onErrorReceived = (message?: string) => {
                cleanup();
                rej(message);
            };

            const timeout = options?.timeout != undefined
                ? setTimeout(onErrorReceived, options.timeout) : null;

            const onMessageReceived = (message: string) => {
                options?.onLogReceived?.(message);
                logMessages.push(message);

                if (!endCondition(message)) return;
    
                if (timeout) clearTimeout(timeout);
                cleanup();
                res(logMessages);
            };

            const cleanup = () => {
                this.off("message", onMessageReceived);
                this.off("error", onErrorReceived);
            };

            this.on("message", onMessageReceived);
            this.on("error", onErrorReceived);
        });
    }

    /**
     * Send the `uci` command and wait for `uciok`. This is called
     * automatically upon creation of the engine.
     */
    async uciMode(timeout?: number) {
        await this.consumeLogs("uci",
            msg => msg.includes("uciok"),
            { timeout: timeout ?? 10000 }
        );
    }

    /** Send the `isready` command and wait for `readyok`. */
    async waitForReady(timeout?: number) {
        await this.consumeLogs("isready",
            msg => msg.includes("readyok"),
            { timeout: timeout ?? 10000 }
        );
    }

    /** Set an option on the engine. Some suggestions are provided. */
    setOption(option: UCIOption, value: UCIValue) {
        this.sendCommand(`setoption name ${option} value ${value}`);
    }

    /** Set number of lines that the engine should produce. */
    setLineCount(lines: number) {
        this.setOption("MultiPV", lines);
    }

    /**
     * Limit the engine's strength to a given Elo.
     * Pass `null` to remove limit.
     */
    setStrengthLimit(elo: number | null) {
        if (elo == null)
            return this.setOption("UCI_LimitStrength", false);

        this.setOption("UCI_LimitStrength", true);
        this.setOption("UCI_Elo", elo);
    }

    /**
     * Set number of CPU threads to use when evaluating.
     * Internally sets the `Threads` UCI option.
     */
    setThreadCount(threads: number) {
        this.setOption("Threads", threads);
    }

    /**
     * Setup the position on the internal board and apply an optional
     * set of UCI format or object moves to it.
     */
    async setPosition(
        position: string | Chess,
        moves?: (string | NormalMove)[] 
    ) {
        position = typeof position == "string"
            ? Chess.fromSetup(parseFen(position).unwrap()).unwrap()
            : position.clone();

        const uciMoves = moves?.map(move => {
            const parsedMove = typeof move == "string"
                ? parseUci(move) : move;
            if (!parsedMove) throw new Error(`invalid move "${move}".`);

            position.play(parsedMove);

            return makeUci(parsedMove);
        });

        this.position = position;
        
        const args = makeUCIArguments({
            fen: makeFen(position.toSetup()),
            moves: uciMoves?.join(" ")
        });

        this.sendCommand(`position ${args}`);
    }

    /** Evaluate the position and return recommended lines. */
    async evaluate(options?: EvaluateOptions) {
        const currentPosition = this.position;
        const lines: EngineLine[] = [];

        const onLogReceived = (log: string) => {
            if (!/info .*depth \d+/.test(log)) return;

            // Extract line information
            const depth = Number(getUCIArgument(log, "depth"));
            const index = Number(getUCIArgument(log, "multipv")) || 1;
            const evaluation = parseScore(getUCIArgument(
                log, "score", "(?:cp|mate) -?\\d+"
            ));
            const moves = (log.match(/(?<= pv ).+/)?.[0].split(" ")
                .map(uci => parseUci(uci) as NormalMove | undefined)
                .filter(move => move != undefined)
            ) || [];

            if (isNaN(depth) || !evaluation) return;

            // Ensure white perspective evaluation
            if (currentPosition.turn == "black") evaluation.value *= -1;

            // Create line object and push to results
            const line: EngineLine = { depth, index, moves, evaluation };

            const duplicateLineIndex = lines.findIndex(line => (
                depth >= line.depth && line.index == index
            ));

            if (duplicateLineIndex >= 0) {
                lines[duplicateLineIndex] = line;
            } else {
                lines.push(line);
            }

            options?.onUpdate?.(lines);
        };

        const args = makeUCIArguments({
            depth: options?.depth || DEFAULT_ENGINE_DEPTH,
            movetime: options?.timeLimit
        });

        await this.consumeLogs(
            `go ${args}`,
            log => log.includes("bestmove"),
            { onLogReceived }
        );

        return lines;
    }
}