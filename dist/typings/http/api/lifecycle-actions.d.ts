import { Action } from "redux";
/**
 * Lifecycle actions is a set of predefined actions
 * defined specifically for http request instance.
 *
 * It must be used if running via dispatching action is not appropriate
 * but actions for request lifecycle is required (for example when using Saga).
 */
export interface LifecycleActions<TParams, TResult, TError> {
    /** A set of fields can be used with Typescript typeof operator. */
    types: LifecycleActionTypes<TParams, TResult, TError>;
    /**
     * Checks if action is lifecycle action.
     */
    isMy(action?: Action): action is ReduxHttpLifecycleActionBase<TParams>;
    /** Checks if action represents request running. */
    isRunning(action?: Action): action is RequestRunningAction<TParams>;
    /** Checks if action represents request successful result. */
    isOk(action?: Action): action is RequestOkAction<TParams, TResult>;
    /** Checks if action represents request error. */
    isError(action?: Action): action is RequestErrorAction<TParams, TError>;
    /** Checks if action is request finishing action, either error or successful. */
    isCompleted(action?: Action): action is (RequestErrorAction<TParams, TError> | RequestOkAction<TParams, TResult>);
    /** Factory for request running lifecycle actions. */
    running(params: TParams): RequestRunningAction<TParams>;
    /** Factory for request successfull finishing lifecycle action. */
    ok(params: TParams, result: TResult): RequestOkAction<TParams, TResult>;
    /** Factory for request error lifecycle action. */
    error(params: TParams, error: TError): RequestErrorAction<TParams, TError>;
}
export interface LifecycleActionTypes<TParams, TResult, TError> {
    params: TParams;
    result: TResult;
    error: TError;
    runningAction: RequestRunningAction<TParams>;
    okAction: RequestOkAction<TParams, TResult>;
    errorAction: RequestErrorAction<TParams, TError>;
}
export interface ReduxHttpLifecycleActionBase<TParams> extends Action {
    params: TParams;
}
export interface RequestRunningAction<TParams> extends ReduxHttpLifecycleActionBase<TParams> {
}
export interface RequestOkAction<TParams, TResult> extends ReduxHttpLifecycleActionBase<TParams> {
    result: TResult;
}
export interface RequestErrorAction<TParams, TError> extends ReduxHttpLifecycleActionBase<TParams> {
    error: TError;
}
