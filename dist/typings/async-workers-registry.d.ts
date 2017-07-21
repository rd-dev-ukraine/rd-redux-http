import { Action } from "redux";
export declare type WorkerFunction = (action?: Action) => Promise<Action>;
export declare function registerAsyncWorkerAuto(asyncWorker: WorkerFunction): string;
export declare function registerAsyncWorker(key: string, asynWorker: WorkerFunction): void;
export declare function retrieveWorker(asyncWorkerID: string): WorkerFunction;
