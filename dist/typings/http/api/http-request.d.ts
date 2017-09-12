/** Defines an interface for configured HTTP request. */
import { HttpResult } from "./result";
import { LifecycleActions } from "./lifecycle-actions";
export interface HttpRequestBasicInfo {
    /** HTTP method (verb) of the request. */
    method: string;
    /** URL template for the request. */
    urlTemplate: string;
}
/**
 * Allows to run configured HTTP request.
 */
export interface HttpRequest<TParams, TResult, TError> extends HttpRequestBasicInfo {
    /**
     * Runs HTTP request with specified parameters.
     * @param params Parameters for HTTP request.
     * @returns A promise which resolves to object with response data or object with error.
     */
    (params: TParams): Promise<HttpResult<TResult, TError>>;
    /**
     * Exposes types of params, error, and result.
     *
     * Useful for avoiding duplication of types.
     * Use it as const result: typeof myRequest.types.result = ...
     */
    types: HttpRequestTypes<TParams, TResult, TError>;
    /** Factory and type guards for redux actions can be used for indicating request lifecycle events. */
    lifecycleActions: LifecycleActions<TParams, TResult, TError>;
}
/**
 * Allows to run configured HTTP request.
 */
export interface HttpRequestWithBody<TBody, TParams, TResult, TError> extends HttpRequestBasicInfo {
    /**
     * Runs HTTP request with specified parameters and body.
     * @param params Parameters for HTTP request.
     * @param body HTTP request body.
     * @returns A promise which resolves to object with response data or object with error.
     */
    (params: TParams, body: TBody): Promise<HttpResult<TResult, TError>>;
    /**
     * Exposes types of params, error, and result.
     *
     * Useful for avoiding duplication of types.
     * Use it as const result: typeof myRequest.types.result = ...
     */
    types: HttpRequestWithBodyTypes<TBody, TParams, TResult, TError>;
    /** Factory and type guards for redux actions can be used for indicating request lifecycle events. */
    lifecycleActions: LifecycleActions<TParams, TResult, TError>;
}
/**
 * Exposes properties which have types related to the request: params, result, errors etc.
 * Don't try to read values of the properties, use it with Typescript typeof operator only.
 */
export interface HttpRequestTypes<TParams, TResult, TError> {
    /**
     * Type of request parameters.
     * Don't access value of the property, use it with Typescript typeof operator only.
     */
    params: TParams;
    /**
     * Type of response.
     * Don't access value of the property, use it with Typescript typeof operator only.
     */
    result: TResult;
    /**
     * Type of error for error response with body.
     * Don't access value of the property, use it with Typescript typeof operator only.
     */
    error: TError;
    /**
     * Union type of all possible successfull and error results.
     * Don't access value of the property, use it with Typescript typeof operator only.
     */
    response: HttpResult<TResult, TError>;
}
/**
 * Exposes properties which have types related to the request: params, result, errors etc.
 * Don't try to read values of the properties, use it with Typescript typeof operator only.
 */
export interface HttpRequestWithBodyTypes<TBody, TParams, TResult, TError> extends HttpRequestTypes<TParams, TResult, TError> {
    /**
     * Type of request body.
     * Don't access value of the property, use it with Typescript typeof operator only.
     */
    body: TBody;
}
