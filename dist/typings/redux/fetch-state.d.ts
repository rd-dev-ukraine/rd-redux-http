import { ReduxHttpRequestState, ReduxHttpInitialState, ReduxHttpFetchingState, ReduxHttpSuccessState, ReduxHttpErrorState } from "./http-request-redux";
import { Action } from "redux";
import { ErrorResponseResult, AuthorizationErrorResult, TransportErrorResult } from "../http";
export declare const FETCH_STATE_INITIAL = "initial";
export declare type FETCH_STATE_INITIAL = "initial";
export declare const FETCH_STATE_FETCHING = "fetching";
export declare type FETCH_STATE_FETCHING = "fetching";
export declare const FETCH_STATE_SUCCESS = "ok";
export declare type FETCH_STATE_SUCCESS = "ok";
export declare const FETCH_STATE_ERROR = "error";
export declare type FETCH_STATE_ERROR = "error";
export declare type FETCH_STATE = FETCH_STATE_INITIAL | FETCH_STATE_FETCHING | FETCH_STATE_SUCCESS | FETCH_STATE_ERROR;
export interface CalculateCommonStateOptions {
    /** If true common state would be loading if at least one state is loading and one is error. */
    waitForLoadingOnError: boolean;
}
export declare class FetchingState {
    static INITIAL: FETCH_STATE_INITIAL;
    static FETCHING: FETCH_STATE_FETCHING;
    static SUCCESS: FETCH_STATE_SUCCESS;
    static ERROR: FETCH_STATE_ERROR;
    static compose(state: FETCH_STATE[], options?: CalculateCommonStateOptions): FETCH_STATE;
    static isInitial: <TParams, TResult, TError>(state?: ReduxHttpInitialState | ReduxHttpFetchingState<TParams, TResult> | ReduxHttpSuccessState<TParams, TResult> | ReduxHttpErrorState<TParams, TResult, TError> | undefined) => state is ReduxHttpInitialState;
    static isFetching: <TParams, TResult, TError>(state?: ReduxHttpInitialState | ReduxHttpFetchingState<TParams, TResult> | ReduxHttpSuccessState<TParams, TResult> | ReduxHttpErrorState<TParams, TResult, TError> | undefined) => state is ReduxHttpFetchingState<TParams, TResult>;
    static isInitialOrFetching: <TParams, TResult, TError>(state?: ReduxHttpInitialState | ReduxHttpFetchingState<TParams, TResult> | ReduxHttpSuccessState<TParams, TResult> | ReduxHttpErrorState<TParams, TResult, TError> | undefined) => state is ReduxHttpInitialState | ReduxHttpFetchingState<TParams, TResult>;
    static isSuccess: <TParams, TResult, TError>(state?: ReduxHttpInitialState | ReduxHttpFetchingState<TParams, TResult> | ReduxHttpSuccessState<TParams, TResult> | ReduxHttpErrorState<TParams, TResult, TError> | undefined) => state is ReduxHttpSuccessState<TParams, TResult>;
    static isError: <TParams, TResult, TError>(state?: ReduxHttpInitialState | ReduxHttpFetchingState<TParams, TResult> | ReduxHttpSuccessState<TParams, TResult> | ReduxHttpErrorState<TParams, TResult, TError> | undefined) => state is ReduxHttpErrorState<TParams, TResult, TError>;
    static hasData: <TParams, TResult, TError>(state?: any) => state is {
        data: TResult;
    };
    static hasParams: <TParams, TResult, TError>(state?: any) => state is {
        params: TParams;
    };
    static getDataOrDefault: <TParams, TResult, TError>(state: ReduxHttpRequestState<TParams, TResult, TError>, defaultData: TResult) => TResult;
    static getErrorResult: <TParams, TResult, TError>(state: ReduxHttpRequestState<TParams, TResult, TError>) => AuthorizationErrorResult | TransportErrorResult | ErrorResponseResult<TError> | undefined;
    static getError: <TParams, TResult, TError>(state: ReduxHttpRequestState<TParams, TResult, TError>) => TError | undefined;
    static fromAction: (action: Action, defaultState?: FETCH_STATE) => FETCH_STATE;
}
