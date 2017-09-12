import { Action, Middleware } from "redux";


import {
    HttpRequest,
    HttpRequestWithBody,
    RunRequestAction,
    RunRequestWithBodyAction
} from "../http";

/**
 * HTTP request augmented for redux integration.
 */
export interface ReduxHttpRequest<TParams, TResult, TError={}> extends HttpRequest<TParams, TResult, TError> {
    /**
     * Creates an action for running request with parameters.
     * To actually run the request dispatch created action.
     */
    run(params: TParams): RunRequestAction<TParams>;

    /**
     * True if action initiating execution of this request.
     */
    isRun(action?: Action): action is RunRequestAction<TParams>;

}

/**
 * HTTP request with body augmented for redux integration.
 */
export interface ReduxHttpRequestWithBody<TBody, TParams, TResult, TError> extends HttpRequestWithBody<TBody, TParams, TResult, TError> {
    /**
     * Creates an action for running request with parameters and body.
     * To actually run the request dispatch created action.
     */
    run(params: TParams, body: TBody): RunRequestWithBodyAction<TBody, TParams>;

    /**
     * True if action initiating execution of this request.
     */
    isRun(action?: Action): action is RunRequestWithBodyAction<TBody, TParams>;
}

/**
 * A redux middleware which augments rd-redux-http requests with methods for redux integration.
 * Apply this middleware to store to run requests when rd-redux-http action is dispatched.
 */
export interface ReduxHttpMiddleware extends Middleware {
    /**
     * Registers rd-redux-http request in middleware and augment request object with redux integration methods.
     */
    register<TParams, TResult, TError>(request: HttpRequest<TParams, TResult, TError>): ReduxHttpRequest<TParams, TResult, TError>;

    /**
     * Registers rd-redux-http request with body in middleware and augment request object with redux integration methods.
     */
    register<TBody, TParams, TResult, TError>(request: HttpRequestWithBody<TBody, TParams, TResult, TError>): ReduxHttpRequestWithBody<TBody, TParams, TResult, TError>;
}
