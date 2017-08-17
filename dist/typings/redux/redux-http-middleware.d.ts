import { Middleware } from "redux";
import { HttpRequest, HttpRequestWithBody } from "../http";
import { ReduxHttpRequest, ReduxHttpRequestWithBody } from "./api";
export interface ReduxHttpMiddleware extends Middleware {
    register<TParams, TResult, TError>(request: HttpRequest<TParams, TResult, TError>): ReduxHttpRequest<TParams, TResult, TError>;
    register<TBody, TParams, TResult, TError>(request: HttpRequestWithBody<TBody, TParams, TResult, TError>): ReduxHttpRequestWithBody<TBody, TParams, TResult, TError>;
}
export declare function reduxHttpMiddleware(): ReduxHttpMiddleware;
