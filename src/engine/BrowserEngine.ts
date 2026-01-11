import { Engine, EngineEvents } from "./Engine";
import { UCICommand } from "./types/uci";

type WorkerListener = (event: WorkerEventMap[keyof WorkerEventMap]) => any;

/** Engine adapter via a `Worker` to run on the browser. */
export class BrowserEngine extends Engine {
    protected worker;

    private constructor(url: string) {
        super();
        this.worker = new Worker(url);
    }

    /** @param url The script URL passed to the `Worker`. */
    static async create(url: string) {
        const engine = new BrowserEngine(url);
        await engine.uciMode();

        return engine;
    }

    sendCommand(command: UCICommand): void {
        this.worker.postMessage(command);
    }

    on<EventType extends keyof EngineEvents>(
        event: EventType,
        fn: EngineEvents[EventType]
    ) {
        const listener = (event == "message"
            ? (event: MessageEvent) => fn(String(event.data))
            : (event: ErrorEvent) => fn(String(event.error))
        ) as WorkerListener;

        this.listeners.set(fn, listener);
        this.worker.addEventListener(event, listener);
    }

    off<EventType extends keyof EngineEvents>(
        event: EventType,
        fn: EngineEvents[EventType]
    ) {
        const listener = this.listeners.get(fn);
        if (!listener) return;

        this.listeners.delete(fn);
        this.worker.removeEventListener(event, listener);
    }

    terminate() {
        this.worker.terminate();
    }
}