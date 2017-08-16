import { HttpRequest, HttpRequestWithBody } from "./http-request";
import { HttpResult } from "./result";
export declare type PrepareRequestFunction<TParams> = (request: Request, params: TParams) => Request;
export declare type PrepareRequestWithBodyFunction<TBody, TParams> = (request: Request, params: TParams, body: TBody) => Request;
export interface HttpRequestConfig<TBody, TParams, TResult, TError> {
    urlTemplate: string;
    appendRestOfParamsToQueryString: boolean;
    method: string;
    pre: PrepareRequestWithBodyFunction<TBody, TParams>[];
    fetch?: (request: Request, params: TParams, body: TBody) => Promise<Response>;
    processResponse: (response: Response, params: TParams, body: TBody) => Promise<HttpResult<TResult, TError>>;
    convertResult?: (body: string) => Promise<TResult | TError>;
}
export interface HttpRequestEntryPoint {
    fetch<TParams = {}>(method: string, urlTemplate: string): HttpRequestConfigurator<TParams>;
    get<TParams = {}>(urlTemplate: string): HttpRequestConfigurator<TParams>;
    post<TParams = {}>(urlTemplate: string): HttpRequestConfigurator<TParams>;
    put<TParams = {}>(urlTemplate: string): HttpRequestConfigurator<TParams>;
    patch<TParams = {}>(urlTemplate: string): HttpRequestConfigurator<TParams>;
    delete<TParams = {}>(urlTemplate: string): HttpRequestConfigurator<TParams>;
}
export interface HttpRequestConfigurator<TParams> {
    jsonBody<TBody>(): HttpRequestConfiguratorWithBody<TBody, TParams>;
    formsBody<TBody>(): HttpRequestConfiguratorWithBody<TBody, TParams>;
    pre(prepareRequest: PrepareRequestFunction<TParams>): this;
    withFetch(customFetch: (request: Request, params: TParams) => Promise<Response>): this;
    resultFromJson<TResult, TError>(): HttpRequestBuilder<TParams, TResult, TError>;
}
export interface HttpRequestConfiguratorWithBody<TBody, TParams> {
    pre(prepareRequest: PrepareRequestWithBodyFunction<TBody, TParams>): this;
    withFetch(customFetch: (request: Request, params: TParams, body: TBody) => Promise<Response>): this;
    resultFromJson<TResult, TError>(): HttpRequestWithBodyBuilder<TBody, TParams, TResult, TError>;
}
export interface HttpRequestBuilder<TParams, TResult, TError> {
    build(): HttpRequest<TParams, TResult, TError>;
}
export interface HttpRequestWithBodyBuilder<TBody, TParams, TResult, TError> {
    build(): HttpRequestWithBody<TBody, TParams, TResult, TError>;
}
