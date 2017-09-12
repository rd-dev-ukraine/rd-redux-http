import { Action } from "redux";

import { OkResult, ErrorResponseResult, AuthorizationErrorResult, TransportErrorResult } from "./result";

/**
 * Lifecycle actions is a set of predefined actions
 * defined specifically for http request instance.
 *
 * It must be used if running via dispatching action is not appropriate
 * but actions for request lifecycle is required (for example when using Saga).
 */
export interface ActionFactory<TParams, TResult, TError> {
    /** A set of fields can be used with Typescript typeof operator. */
    types: ActionTypes<TParams, TResult, TError>;

    /**
     * Checks if action is lifecycle action.
     */
    isMy(action?: Action): action is ReduxHttpLifecycleActionBase<TParams>;

    /** Checks if action represents request running. */
    isRunning(action?: Action): action is RequestRunningAction<TParams>;

    /** Checks if action represents request successful result. */
    isOk(action?: Action): action is OkResultAction<TParams, TResult>;

    /** Checks if action represents request error. */
    isError(action?: Action): action is ErrorResultAction<TParams, TError>;

    isErrorResponse(action?: Action): action is ErrorResponseAction<TParams, TError>;

    isAuthorizationError(action?: Action): action is AuthorizationErrorResultAction<TParams>;

    isTransportError(action?: Action): action is TransportErrorResultAction<TParams>;

    /** Checks if action is request finishing action, either error or successful. */
    isCompleted(action?: Action): action is (ErrorResultAction<TParams, TError> | OkResultAction<TParams, TResult>);

    /** Factory for request running lifecycle actions. */
    running(params: TParams): RequestRunningAction<TParams>;

    /** Factory for request successfull finishing lifecycle action. */
    ok(params: TParams, result: OkResult<TResult>): OkResultAction<TParams, TResult>;

    /** Factory for request error lifecycle action. */
    error(params: TParams, error: ErrorResponseResult<TError> | AuthorizationErrorResult | TransportErrorResult): ErrorResultAction<TParams, TError>;
}

export interface RunRequestActionFactory<TParams> {
    run(params: TParams): RunRequestAction<TParams>;

    isRun(action?: Action): action is RunRequestAction<TParams>;
}

export interface RunRequestWithBodyActionFactory<TParams, TBody> {
    run(params: TParams, body: TBody): RunRequestWithBodyAction<TParams, TBody>;

    isRun(action?: Action): action is RunRequestWithBodyAction<TParams, TBody>;
}

export interface ActionTypes<TParams, TResult, TError> {
    params: TParams;
    result: TResult;
    error: TError;

    runningAction: RequestRunningAction<TParams>;
    okAction: OkResultAction<TParams, TResult>;
    errorAction: ErrorResultAction<TParams, TError>;
}

export interface ReduxHttpLifecycleActionBase<TParams> extends Action {
    params: TParams;
}

/** An action dispatched when request is running via middleware or manually. */
export interface RequestRunningAction<TParams> extends ReduxHttpLifecycleActionBase<TParams> {}

/** An action dispatched if HTTP request completed successfully. */
export interface OkResultAction<TParams, TResult> extends ReduxHttpLifecycleActionBase<TParams>, OkResult<TResult> { }

/** An action dispatched if HTTP request finished with error response (usually 400 Bad Request status). */
export interface ErrorResponseAction<TParams, TError> extends ReduxHttpLifecycleActionBase<TParams>, ErrorResponseResult<TError> { }

/** An action dispatched if HTTP request finished with authorization error (401 or 403 status). */
export interface AuthorizationErrorResultAction<TParams> extends ReduxHttpLifecycleActionBase<TParams>, AuthorizationErrorResult { }

/** An action dispatched if HTTP request failed. */
export interface TransportErrorResultAction<TParams> extends ReduxHttpLifecycleActionBase<TParams>, TransportErrorResult { }

/** Union types of all error actions. */
export type ErrorResultAction<TParams, TError> = ErrorResponseAction<TParams, TError> | AuthorizationErrorResultAction<TParams> | TransportErrorResultAction<TParams>;


export interface RunRequestAction<TParams> extends ReduxHttpLifecycleActionBase<TParams> {
}

export interface RunRequestWithBodyAction<TParams, TBody> extends ReduxHttpLifecycleActionBase<TParams> {
    body: TBody;
}