import { Action, Middleware } from "redux";


import {
    HttpRequest,
    HttpRequestWithBody,
    OkResult,
    ErrorResponseResult,
    AuthorizationErrorResult,
    TransportErrorResult
} from "../http";

/**
 * Base action for rd-redux-http actions.
 */
export interface HttpRequestActionBase<TParams> extends Action {
    /** Request parameters. */
    params: TParams;
}

/** Redux action for running HTTP request with parameters. */
export interface RunHttpRequestAction<TParams> extends HttpRequestActionBase<TParams> { }

/** Redux action for running HTTP request with parameters and body. */
export interface RunHttpRequestWithBodyAction<TBody, TParams> extends HttpRequestActionBase<TParams> {
    /** Request body. */
    body: TBody;
}

/** An action dispatched if HTTP request completed successfully. */
export interface OkResultAction<TParams, TResult> extends RunHttpRequestAction<TParams>, OkResult<TResult> { }

/** An action dispatched if HTTP request finished with error response (usually 400 Bad Request status). */
export interface ErrorResponseAction<TParams, TError> extends RunHttpRequestAction<TParams>, ErrorResponseResult<TError> { }

/** An action dispatched if HTTP request finished with authorization error (401 or 403 status). */
export interface AuthorizationErrorResultAction<TParams> extends RunHttpRequestAction<TParams>, AuthorizationErrorResult { }

/** An action dispatched if HTTP request failed. */
export interface TransportErrorResultAction<TParams> extends RunHttpRequestAction<TParams>, TransportErrorResult { }

/** Union types of all error actions. */
export type ErrorAction<TParams, TError> = ErrorResponseAction<TParams, TError> | AuthorizationErrorResultAction<TParams> | TransportErrorResultAction<TParams>;


/**
 * A set of type guards allows to check and narrowing actions to rd-redux-http actions.
 */
export interface RequestTypeGuards<TParams, TResult, TError> {
    /**
     * True if action belongs to this request object.
     */
    isMy(action?: Action): action is HttpRequestActionBase<TParams>;

    /**
     * True if action is OkAction of this request object.
     */
    isOk(action?: Action): action is OkResultAction<TParams, TResult>;

    /**
     * True if action is any error action of this request object.
     */
    isError(action?: Action): action is ErrorAction<TParams, TError>;

    /**
     * True if action is error response action of this request object.
     */
    isErrorResponse(action?: Action): action is ErrorResponseAction<TParams, TError>;

    /**
     * True if action is authorization error action of this request object.
     */
    isAuthorizationError(action: Action): action is AuthorizationErrorResultAction<TParams>;

    /**
     * True if action is other error action of this request object.
     */
    isTransportError(action: Action): action is TransportErrorResultAction<TParams>;
}

/**
 * HTTP request augmented for redux integration.
 */
export interface ReduxHttpRequest<TParams, TResult, TError={}> extends HttpRequest<TParams, TResult, TError>, RequestTypeGuards<TParams, TResult, TError> {
    /**
     * Creates an action for running request with parameters.
     * To actually run the request dispatch created action.
     */
    run(params: TParams): RunHttpRequestAction<TParams>;

    /**
     * True if action initiating execution of this request.
     */
    isRunning(action?: Action): action is RunHttpRequestAction<TParams>;

}

/**
 * HTTP request with body augmented for redux integration.
 */
export interface ReduxHttpRequestWithBody<TBody, TParams, TResult, TError> extends HttpRequestWithBody<TBody, TParams, TResult, TError>, RequestTypeGuards<TParams, TResult, TError> {
    /**
     * Creates an action for running request with parameters and body.
     * To actually run the request dispatch created action.
     */
    run(params: TParams, body: TBody): RunHttpRequestWithBodyAction<TBody, TParams>;

    /**
     * True if action initiating execution of this request.
     */
    isRunning(action?: Action): action is RunHttpRequestWithBodyAction<TBody, TParams>;
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
