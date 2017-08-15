export interface OkResult<TResult> {
    ok: true;
    result: TResult;
}

/** 
 * Server responded correctly but with error status, usually bad request. 
 * Optional body can be provided by server. 
 */
export interface ErrorResponseResult<TError> {
    ok: false;
    type: "response";
    error: TError;
}

/** 
 * Server responded with authorization error status code. 
 */
export interface AuthorizationErrorResult {
    ok: false;
    type: "authorization";
    status: number;
}

/** Fetch promise rejected or server returns an error other than bad request or authorization. */
export interface TransportErrorResult {
    ok: false;
    type: "transport";
    reason: "fetch-rejected" | "invalid-body" | "other";
    statusCode?: number;
    error: any;
}

export type HttpResult<TResult, TError> = OkResult<TResult> | ErrorResponseResult<TError> | AuthorizationErrorResult | TransportErrorResult;