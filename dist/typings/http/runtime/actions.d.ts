import { ActionFactory, RunRequestActionFactory, RunRequestWithBodyActionFactory } from "../api";
export declare function createActions<TParams, TResult, TError, TBody = undefined>(id: string, method: string, url: string): ActionFactory<TParams, TResult, TError> & RunRequestActionFactory<TParams> & RunRequestWithBodyActionFactory<TParams, TBody>;
