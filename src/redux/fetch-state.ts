import {
    ReduxHttpRequestState,
    ReduxHttpInitialState,
    ReduxHttpFetchingState,
    ReduxHttpSuccessState,
    ReduxHttpErrorState
} from "./http-request-redux";
import { Action } from "redux";
import { anyRequest } from "../http/runtime/any-request";

export const FETCH_STATE_INITIAL = "initial";
export type FETCH_STATE_INITIAL = "initial";

export const FETCH_STATE_FETCHING = "fetching";
export type FETCH_STATE_FETCHING = "fetching";

export const FETCH_STATE_SUCCESS = "ok";
export type FETCH_STATE_SUCCESS = "ok";

export const FETCH_STATE_ERROR = "error";
export type FETCH_STATE_ERROR = "error";

export type FETCH_STATE = FETCH_STATE_INITIAL | FETCH_STATE_FETCHING | FETCH_STATE_SUCCESS | FETCH_STATE_ERROR;

export interface CalculateCommonStateOptions {
    /** If true common state would be loading if at least one state is loading and one is error. */
    waitForLoadingOnError: boolean;
}

export class FetchingState {
    public static INITIAL: FETCH_STATE_INITIAL = FETCH_STATE_INITIAL;
    public static FETCHING: FETCH_STATE_FETCHING = FETCH_STATE_FETCHING;
    public static SUCCESS: FETCH_STATE_SUCCESS = FETCH_STATE_SUCCESS;
    public static ERROR: FETCH_STATE_ERROR = FETCH_STATE_ERROR;

    public static compose(state: FETCH_STATE[], options?: CalculateCommonStateOptions): FETCH_STATE {
        options = options || {
            waitForLoadingOnError: false
        };

        if (!state.length) {
            throw new Error("States are empty");
        }

        const unique = new Set<FETCH_STATE>(state);

        if (unique.has(FETCH_STATE_FETCHING)) {
            return unique.has(FETCH_STATE_ERROR)
                ? options.waitForLoadingOnError
                    ? FETCH_STATE_FETCHING
                    : FETCH_STATE_ERROR
                : FETCH_STATE_FETCHING;
        }

        if (unique.has(FETCH_STATE_ERROR)) {
            return FETCH_STATE_ERROR;
        }

        if (unique.has(FETCH_STATE_INITIAL)) {
            return FETCH_STATE_INITIAL;
        }

        return FETCH_STATE_SUCCESS;
    }

    public static isInitial = <TParams, TResult, TError>(
        state?: ReduxHttpRequestState<TParams, TResult, TError>
    ): state is ReduxHttpInitialState => !!state && state.fetchState === FETCH_STATE_INITIAL;

    public static isFetching = <TParams, TResult, TError>(
        state?: ReduxHttpRequestState<TParams, TResult, TError>
    ): state is ReduxHttpFetchingState<TParams, TResult> => !!state && state.fetchState === FETCH_STATE_FETCHING;

    public static isInitialOrFetching = <TParams, TResult, TError>(
        state?: ReduxHttpRequestState<TParams, TResult, TError>
    ): state is ReduxHttpInitialState | ReduxHttpFetchingState<TParams, TResult> =>
        FetchingState.isInitial(state) || FetchingState.isFetching(state);

    public static isSuccess = <TParams, TResult, TError>(
        state?: ReduxHttpRequestState<TParams, TResult, TError>
    ): state is ReduxHttpSuccessState<TParams, TResult> => !!state && state.fetchState === FETCH_STATE_SUCCESS;

    public static isError = <TParams, TResult, TError>(
        state?: ReduxHttpRequestState<TParams, TResult, TError>
    ): state is ReduxHttpErrorState<TParams, TResult, TError> => !!state && state.fetchState === FETCH_STATE_ERROR;

    public static hasData = <TParams, TResult, TError>(
        state?: ReduxHttpRequestState<TParams, TResult, TError> | any
    ): state is { data: TResult } => !!state && state.fetchState !== FETCH_STATE_INITIAL && !!state.data;

    public static getDataOrDefault = <TParams, TResult, TError>(
        state: ReduxHttpRequestState<TParams, TResult, TError>,
        defaultData: TResult
    ): TResult => {
        return FetchingState.hasData(state) ? state.data || defaultData : defaultData;
    };

    public static fromAction = (action: Action, defaultState: FETCH_STATE = FETCH_STATE_INITIAL): FETCH_STATE => {
        if (anyRequest.isRunning(action)) {
            return FETCH_STATE_FETCHING;
        }

        if (anyRequest.isOk(action)) {
            return FETCH_STATE_SUCCESS;
        }

        if (anyRequest.isError(action)) {
            return FETCH_STATE_ERROR;
        }

        return defaultState || FETCH_STATE_INITIAL;
    };
}
