import { v4 } from "uuid";
import { Action } from "redux";

const registry: { [key: string]: Function } = {};

export type WorkerFunction = (action?: Action) => Promise<Action>;

/** Registers custom async function and returns ID which */
export function registerAsyncWorkerAuto(asyncWorker: WorkerFunction): string {
    if (!asyncWorker) {
        throw new Error("Async worker is not provided.");
    }

    const id = v4();
    registry[id] = asyncWorker;

    return id;
}

export function registerAsyncWorker(key: string, asynWorker: WorkerFunction): void {
    if (!key) {
        throw new Error("Worker key is not provided.");
    }

    if (!asynWorker) {
        throw new Error("Async worker is not provided.");
    }

    registry[key] = asynWorker;
}

/** Gets previously registered custom function by ID. */
export function retrieveWorker(asyncWorkerID: string): WorkerFunction {
    if (!asyncWorkerID) {
        throw new Error("Async worker identifier is not provided.");
    }

    const fn = registry[asyncWorkerID];
    if (!fn) {
        throw new Error("Async worker with such ID is not registered.");
    }

    return fn as WorkerFunction;
}

