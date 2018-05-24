import { Action } from "redux";
import { ErrorResponseResult, AuthorizationErrorResult, TransportErrorResult, HttpRequestTypes } from "../http";


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

export type ReduxHttpRequestState<TParams, TResult, TError> =
    ReduxHttpInitialState | ReduxHttpLoadingState<TParams> | ReduxHttpSuccessState<TParams, TResult> | ReduxHttpErrorState<TParams, TError>;

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
    reducer(state: ReduxHttpRequestState<TParams, TResult, TError>, action: Action): ReduxHttpRequestState<TParams, TResult, TError>;
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
export interface ReduxHttpRequestWithBodyTypes<TBody, TParams, TResult, TError> extends ReduxHttpRequestTypes<TParams, TResult, TError> {
    /**
     * Type of request body.
     * Don't access value of the property, use it with Typescript typeof operator only.
     */
    body: TBody;
}