import { Action } from "redux";
import { HttpRequest, HttpRequestWithBody, OkResult, ErrorResponseResult, AuthorizationErrorResult, TransportErrorResult } from "../http";
export interface HttpRequestActionBase<TParams> extends Action {
    params: TParams;
}
export interface RunHttpRequestAction<TParams> extends HttpRequestActionBase<TParams> {
}
export interface RunHttpRequestWithBodyAction<TBody, TParams> extends HttpRequestActionBase<TParams> {
    body: TBody;
}
export interface OkResultAction<TParams, TResult> extends RunHttpRequestAction<TParams>, OkResult<TResult> {
}
export interface ErrorResponseAction<TParams, TError> extends RunHttpRequestAction<TParams>, ErrorResponseResult<TError> {
}
export interface AuthorizationErrorResultAction<TParams> extends RunHttpRequestAction<TParams>, AuthorizationErrorResult {
}
export interface TransportErrorResultAction<TParams> extends RunHttpRequestAction<TParams>, TransportErrorResult {
}
export declare type ErrorAction<TParams, TError> = ErrorResponseAction<TParams, TError> | AuthorizationErrorResultAction<TParams> | TransportErrorResultAction<TParams>;
export interface RequestTypeGuards<TParams, TResult, TError> {
    isMy(action?: Action): action is HttpRequestActionBase<TParams>;
    isOk(action?: Action): action is OkResultAction<TParams, TResult>;
    isError(action?: Action): action is ErrorAction<TParams, TError>;
    isErrorResponse(action?: Action): action is ErrorResponseAction<TParams, TError>;
    isAuthorizationError(action: Action): action is AuthorizationErrorResultAction<TParams>;
    isTransportError(action: Action): action is TransportErrorResultAction<TParams>;
}
export interface ReduxHttpRequest<TParams, TResult, TError = {}> extends HttpRequest<TParams, TResult, TError>, RequestTypeGuards<TParams, TResult, TError> {
    run(params: TParams): RunHttpRequestAction<TParams>;
    isRunning(action?: Action): action is RunHttpRequestAction<TParams>;
}
export interface ReduxHttpRequestWithBody<TBody, TParams, TResult, TError> extends HttpRequestWithBody<TBody, TParams, TResult, TError>, RequestTypeGuards<TParams, TResult, TError> {
    run(params: TParams, body: TBody): RunHttpRequestWithBodyAction<TBody, TParams>;
    isRunning(action?: Action): action is RunHttpRequestWithBodyAction<TBody, TParams>;
}
