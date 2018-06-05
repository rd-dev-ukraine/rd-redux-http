import { Middleware } from "redux";

import { HttpRequest, HttpRequestWithBody, MakeRequestActionFactory, MakeRequestWithBodyActionFactory } from "../http";

import { WithReducer, ReduxHttpRequestTypes, ReduxHttpRequestWithBodyTypes } from "./http-request-redux";

/**
 * HTTP request augmented for redux integration.
 */
export interface ReduxHttpRequest<TParams, TResult, TError = {}>
    extends HttpRequest<TParams, TResult, TError>,
        MakeRequestActionFactory<TParams>,
        WithReducer<TParams, TResult, TError> {
    /**
     * Exposes types of params, error, and result.
     *
     * Useful for avoiding duplication of types.
     * Use it as const result: typeof myRequest.types.result = ...
     */
    types: ReduxHttpRequestTypes<TParams, TResult, TError>;
}

/**
 * HTTP request with body augmented for redux integration.
 */
export interface ReduxHttpRequestWithBody<TBody, TParams, TResult, TError>
    extends HttpRequestWithBody<TBody, TParams, TResult, TError>,
        MakeRequestWithBodyActionFactory<TParams, TBody>,
        WithReducer<TParams, TResult, TError> {
    types: ReduxHttpRequestWithBodyTypes<TBody, TParams, TResult, TError>;
}

/**
 * A redux middleware which augments rd-redux-http requests with methods for redux integration.
 * Apply this middleware to store to run requests when rd-redux-http action is dispatched.
 */
export interface ReduxHttpMiddleware extends Middleware {
    /**
     * Registers rd-redux-http request in middleware and augment request object with redux integration methods.
     */
    register<TParams, TResult, TError, TTransformed = TResult>(
        request: HttpRequest<TParams, TResult, TError>,
        transform?: (result: TResult, params?: TParams) => TTransformed
    ): ReduxHttpRequest<TParams, TTransformed, TError>;

    /**
     * Registers rd-redux-http request with body in middleware and augment request object with redux integration methods.
     */
    register<TBody, TParams, TResult, TError, TTransformed = TResult>(
        request: HttpRequestWithBody<TBody, TParams, TResult, TError>,
        transform?: (result: TResult, params?: TParams, body?: TBody) => TTransformed
    ): ReduxHttpRequestWithBody<TBody, TParams, TTransformed, TError>;
}
