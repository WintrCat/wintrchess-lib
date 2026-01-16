import { spawn } from "child_process";

import { Engine, EngineEvents } from "./Engine";
import { UCICommand } from "./types/uci";

/** Engine adapter that spawns a child process. */
export class ProcessEngine extends Engine {
    protected process;

    private constructor(command: string) {
        super();
        this.process = spawn(command);
    }

    /** @param command The command sent to spawn the process. */
    static async create(command: string) {
        const engine = new ProcessEngine(command);
        await engine.uciMode();

        return engine;
    }

    sendCommand(command: UCICommand) {
        this.process.stdin.write(command + "\n");
    }

    on<EventType extends keyof EngineEvents>(
        event: EventType,
        fn: EngineEvents[EventType]
    ) {
        const listener = event == "message"
            ? (data: any) => fn(String(data))
            : (error: Error) => fn(error.message);

        if (event == "message") {
            this.process.stdout.on("data", listener);
        } else {
            this.process.stderr.on("error", listener);
        }

        this.listeners.set(fn, listener);
    }

    off<EventType extends keyof EngineEvents>(
        event: EventType,
        fn: EngineEvents[EventType]
    ) {
        const listener = this.listeners.get(fn);
        if (!listener) return;

        this.listeners.delete(fn);
        
        if (event == "message") {
            this.process.stdout.off("data", listener);
        } else {
            this.process.stderr.off("error", listener);
        }
    }

    terminate() {
        this.process.kill();
    }
}