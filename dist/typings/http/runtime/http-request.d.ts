import { HttpRequestWithBody, HttpRequestConfig } from "../api";
export declare function createHttpRequest<TBody, TParams, TResult, TError>(config: HttpRequestConfig<TBody, TParams, TResult, TError>): HttpRequestWithBody<TBody, TParams, TResult, TError>;
