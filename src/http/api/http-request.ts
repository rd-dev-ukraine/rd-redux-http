/** Defines an interface for configured HTTP request. */
import { HttpResult } from "./result";

export interface HttpRequestBasicInfo {
    method: string;
    urlTemplate: string;
}

export interface HttpRequest<TParams, TResult, TError> extends HttpRequestBasicInfo {
    (params: TParams): Promise<HttpResult<TResult, TError>>;

    /**
     * Exposes types of params, error, and result.
     */
    types: HttpRequestTypes<TParams, TResult, TError>;
}

export interface HttpRequestWithBody<TBody, TParams, TResult, TError> extends HttpRequestBasicInfo{
    (params: TParams, body: TBody): Promise<HttpResult<TResult, TError>>;

    /**
     * Exposes types of params, error, body and result.
     */
    types: HttpRequestWithBodyTypes<TBody, TParams, TResult, TError>;
}

export interface HttpRequestTypes<TParams, TResult, TError> {
    params: TParams;
    result: TResult;
    error: TError;
    response: HttpResult<TResult, TError>;
}

export interface HttpRequestWithBodyTypes<TBody, TParams, TResult, TError> extends HttpRequestTypes<TParams, TResult, TError> {
    body: TBody;
}