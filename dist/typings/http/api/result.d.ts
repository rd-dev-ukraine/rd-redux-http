export interface OkResult<TResult> {
    ok: true;
    result: TResult;
}
export interface ErrorResponseResult<TError> {
    ok: false;
    errorType: "response";
    error: TError;
}
export interface AuthorizationErrorResult {
    ok: false;
    errorType: "authorization";
    status: number;
}
export interface TransportErrorResult {
    ok: false;
    errorType: "transport";
    reason: "fetch-rejected" | "invalid-body" | "other";
    statusCode?: number;
    error: any;
}
export declare type HttpResult<TResult, TError> = OkResult<TResult> | ErrorResponseResult<TError> | AuthorizationErrorResult | TransportErrorResult;
