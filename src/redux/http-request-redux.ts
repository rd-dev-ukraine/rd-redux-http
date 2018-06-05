import { Action } from "redux";
import { ErrorResponseResult, AuthorizationErrorResult, TransportErrorResult, HttpRequestTypes } from "../http";
import { FETCH_STATE_INITIAL, FETCH_STATE_FETCHING, FETCH_STATE_SUCCESS, FETCH_STATE_ERROR } from "./fetch-state";

export interface ReduxHttpInitialState {
    fetchState: FETCH_STATE_INITIAL;
}

export function isFetchingStateInitial<TParams, TResult, TError>(
    state?: ReduxHttpRequestState<TParams, TResult, TError>
): state is ReduxHttpInitialState {
    return !!state && state.fetchState === FETCH_STATE_INITIAL;
}

export interface ReduxHttpFetchingState<TParams> {
    fetchState: FETCH_STATE_FETCHING;
    params: TParams;
}

export function isFetchingStateFetching<TParams, TResult, TError>(
    state?: ReduxHttpRequestState<TParams, TResult, TError>
): state is ReduxHttpFetchingState<TParams> {
    return !!state && state.fetchState === FETCH_STATE_FETCHING;
}

export interface ReduxHttpSuccessState<TParams, TResult> {
    fetchState: FETCH_STATE_SUCCESS;
    params: TParams;
    data: TResult;
}

export function isFetchingStateSuccess<TParams, TResult, TError>(
    state?: ReduxHttpRequestState<TParams, TResult, TError>
): state is ReduxHttpSuccessState<TParams, TResult> {
    return !!state && state.fetchState === FETCH_STATE_SUCCESS;
}

export interface ReduxHttpErrorState<TParams, TError> {
    fetchState: FETCH_STATE_ERROR;
    params: TParams;
    error: ErrorResponseResult<TError> | AuthorizationErrorResult | TransportErrorResult;
}

export function isFetchingStateError<TParams, TResult, TError>(
    state?: ReduxHttpRequestState<TParams, TResult, TError>
): state is ReduxHttpErrorState<TParams, TError> {
    return !!state && state.fetchState === FETCH_STATE_ERROR;
}

export type ReduxHttpRequestState<TParams, TResult, TError> =
    | ReduxHttpInitialState
    | ReduxHttpFetchingState<TParams>
    | ReduxHttpSuccessState<TParams, TResult>
    | ReduxHttpErrorState<TParams, TError>;

/** Adds reducer method to HTTP request object. */
export interface WithReducer<TParams, TResult, TError> {
    /**
     * Standard reducer method which processes actions belongs to the request.
     *
     * Note reducer preserves all data in state and manages its own properties only.
     * It means you could put your extra data in state and do additional processing.
     *
     * For example:
     *
     * function myReducer(state, action) {
     *     const processedState = myHttpRequest.reducer(state, action);
     *
     *     switch(action.type) {
     *         case MY_ACTION_TYPE:
     *              return {
     *                   ...processedState,
     *                   myData: action.data
     *              };
     *         default:
     *             return processedState;
     *     }
     * }
     */
    reducer(
        state: ReduxHttpRequestState<TParams, TResult, TError>,
        action: Action
    ): ReduxHttpRequestState<TParams, TResult, TError>;
}

/**
 * Exposes properties which have types related to the request: params, result, errors etc.
 * Don't try to read values of the properties, use it with Typescript typeof operator only.
 */
export interface ReduxHttpRequestTypes<TParams, TResult, TError> extends HttpRequestTypes<TParams, TResult, TError> {
    /** Type of state processed by built-in reducer. */
    reduxState: ReduxHttpRequestState<TParams, TResult, TError>;
}

/**
 * Exposes properties which have types related to the request: params, result, errors etc.
 * Don't try to read values of the properties, use it with Typescript typeof operator only.
 */
export interface ReduxHttpRequestWithBodyTypes<TBody, TParams, TResult, TError>
    extends ReduxHttpRequestTypes<TParams, TResult, TError> {
    /**
     * Type of request body.
     * Don't access value of the property, use it with Typescript typeof operator only.
     */
    body: TBody;
}
