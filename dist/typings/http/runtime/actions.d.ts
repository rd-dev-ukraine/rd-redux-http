import { ActionFactory, MakeRequestActionFactory, MakeRequestWithBodyActionFactory } from "../api";
export declare function createActions<TParams, TResult, TError, TBody = undefined>(id: string, method: string, url: string): ActionFactory<TParams, TResult, TError> & MakeRequestActionFactory<TParams> & MakeRequestWithBodyActionFactory<TParams, TBody>;
