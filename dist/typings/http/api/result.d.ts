/** Result for successfull request. */
export interface OkResult<TResult> {
    /** True if request processed successfully. */
    ok: true;
    /** A data returned by the server in response body. */
    result: TResult;
}
/**
 * Server responded correctly but with error status, usually bad request.
 * Optional body can be provided by server.
 */
export interface ErrorResponseResult<TError> {
    /** False as server responded with error. */
    ok: false;
    /** Error type 'response' means server returns some error details. */
    errorType: "response";
    /** Error returned by the server. */
    error: TError;
}
/**
 * Server responded with authorization error status code.
 */
export interface AuthorizationErrorResult {
    /** False as server responded with error. */
    ok: false;
    /** Error type 'authorization' means server responded with 401 or 403 status code. */
    errorType: "authorization";
    /** Status code returned by server. */
    status: number;
}
/** Fetch promise rejected or server returns an error other than bad request or authorization. */
export interface TransportErrorResult {
    /** False as server responded with error or no response given. */
    ok: false;
    /** Transport means some unprocessable error occured. */
    errorType: "transport";
    /**
     * Reasons:
     * * 'fetch-rejected' - a promise returned by fetch was rejected.
     * * 'invalid-body' - a body of response can't be parsed.
     * * 'other' - other error.
     */
    reason: "fetch-rejected" | "invalid-body" | "other";
    /**
     * Status code returned by server in case server responded, undefined otherwise.
     */
    statusCode?: number;
    /**
     * Error object.
     */
    error: any;
}
export declare type HttpResult<TResult, TError> = OkResult<TResult> | ErrorResponseResult<TError> | AuthorizationErrorResult | TransportErrorResult;
