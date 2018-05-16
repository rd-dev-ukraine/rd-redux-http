import { Action } from "redux";

import { OkResult, ErrorResponseResult, AuthorizationErrorResult, TransportErrorResult } from "./result";

/**
 * Lifecycle actions is a set of predefined actions
 * defined specifically for http request instance.
 *
 * It must be used if running via dispatching action is not appropriate
 * but actions for request lifecycle is required (for example when using Saga).
 */
export interface ActionFactory<TParams, TResult, TError> extends ActionTypeGuards<TParams, TResult, TError> {
    /** A set of fields can be used with Typescript typeof operator. */
    types: ActionTypes<TParams, TResult, TError>;

    /** Factory for request running lifecycle actions. */
    running(params: TParams): RequestRunningAction<TParams>;

    /** Factory for request successfull finishing lifecycle action. */
    ok(params: TParams, result: OkResult<TResult>): OkResultAction<TParams, TResult>;

    /** Factory for request error lifecycle action. */
    error(params: TParams, error: ErrorResponseResult<TError> | AuthorizationErrorResult | TransportErrorResult): ErrorResultAction<TParams, TError>;
}

export interface ActionTypeGuards<TParams, TResult, TError> {
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
}

export interface MakeRequestActionTypeGuards<TParams> {
    /**
     * True if action initiating execution of this request.
     */
    isTriggering(action?: Action): action is TriggerRequestAction<TParams>;
}

export interface MakeRequestActionFactory<TParams> extends MakeRequestActionTypeGuards<TParams> {
    /**
     * Creates an action for running request with parameters.
     * To actually run the request dispatch created action.
     */
    trigger(params: TParams): TriggerRequestAction<TParams>;
}

export interface MakeRequestWithBodyActionTypeGuards<TParams ,TBody> {
    /**
     * True if action initiating execution of this request.
     */
    isTriggering(action?: Action): action is TriggerRequestWithBodyAction<TParams, TBody>;
}

export interface MakeRequestWithBodyActionFactory<TParams, TBody> extends MakeRequestWithBodyActionTypeGuards<TParams, TBody>{
    /**
     * Creates an action for running request with parameters and body.
     * To actually run the request dispatch created action.
     */
    trigger(params: TParams, body: TBody): TriggerRequestWithBodyAction<TParams, TBody>;


}

export interface ActionTypes<TParams, TResult, TError> {
    /** Type of TParams type param. */
    params: TParams;

    /** Type of TResult type param. */
    result: TResult;

    /** Type of TError type param. */
    error: TError;

    /** Type of action representing running request. */
    runningAction: RequestRunningAction<TParams>;

    /** Type of action representing successfull result of request execution. */
    okAction: OkResultAction<TParams, TResult>;

    /** Type of action representing error result of request execution. */
    errorAction: ErrorResultAction<TParams, TError>;
}

export interface ReduxHttpLifecycleActionBase<TParams> extends Action {
    params: TParams;
}

/** An action dispatched when request is running via middleware or manually. */
export interface RequestRunningAction<TParams> extends ReduxHttpLifecycleActionBase<TParams> { }

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

export interface TriggerRequestAction<TParams> extends ReduxHttpLifecycleActionBase<TParams> {
}

export interface TriggerRequestWithBodyAction<TParams, TBody> extends ReduxHttpLifecycleActionBase<TParams> {
    body: TBody;
}