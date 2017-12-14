import { Action } from "redux";
import { ErrorResponseResult, AuthorizationErrorResult, TransportErrorResult } from "./result";
export interface ReduxHttpInitialState {
    fetchState: "initial";
}
export interface ReduxHttpLoadingState<TParams> {
    fetchState: "loading";
    params: TParams;
}
export interface ReduxHttpSuccessState<TParams, TResult> {
    fetchState: "successful";
    params: TParams;
    data: TResult;
}
export interface ReduxHttpErrorState<TParams, TError> {
    fetchState: "error";
    params: TParams;
    error: ErrorResponseResult<TError> | AuthorizationErrorResult | TransportErrorResult;
}
export declare type ReduxHttpRequestState<TParams, TResult, TError> = ReduxHttpInitialState | ReduxHttpLoadingState<TParams> | ReduxHttpSuccessState<TParams, TResult> | ReduxHttpErrorState<TParams, TError>;
/** Adds reducer method to HTTP request object. */
export interface WithReducer<TParams, TResult, TError> {
    /**
     * Standard reducer method which processes actions belongs to the request.
     */
    reducer(state: ReduxHttpRequestState<TParams, TResult, TError>, action: Action): ReduxHttpRequestState<TParams, TResult, TError>;
}
