import { Action } from "redux";
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
    error: TError;
}
export declare type ReduxHttpRequestState<TParams, TResult, TError> = ReduxHttpInitialState | ReduxHttpLoadingState<TParams> | ReduxHttpSuccessState<TParams, TResult> | ReduxHttpErrorState<TParams, TError>;
export interface ReduxHttpRequestWithReducer<TParams, TResult, TError> {
    reducer(state: ReduxHttpRequestState<TParams, TResult, TError>, action: Action): ReduxHttpRequestState<TParams, TResult, TError>;
}
