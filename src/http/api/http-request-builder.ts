import { HttpRequest, HttpRequestWithBody } from "./http-request";
import { HttpResult } from "./result";

export type PrepareRequestFunction<TParams> = (request: Request, params: TParams) => Request;
export type PrepareRequestWithBodyFunction<TBody, TParams> = (request: Request, params: TParams, body: TBody) => Request;

export interface HttpRequestConfig<TBody, TParams, TResult, TError> {
    /** URL with parameter substitutions */
    urlTemplate: string;
    /** True if values from params object not used in URL will be appended as query string. */
    appendRestOfParamsToQueryString: boolean;

    method: string;

    /** An array of functions alters the initial request. */
    pre: PrepareRequestWithBodyFunction<TBody, TParams>[];

    /**
     * Replace of default fetch function.
     * Use it if you need to implement for example retry logic
     * or authentication token refreshing etc.
     */
    fetch?: (request: Request, params: TParams, body: TBody) => Promise<Response>;

    /**
     * Converts a fetch response to a typed results.
     */
    processResponse: (response: Response, params: TParams, body: TBody) => Promise<HttpResult<TResult, TError>>;

    /**
     * Converts string body to result or error.
     */
    convertResult?: (body: string, isError: boolean, params: TParams) => Promise<TResult | TError>;
}

export interface HttpRequestEntryPoint {
    fetch<TParams={}>(method: string, urlTemplate: string): HttpRequestConfigurator<TParams>;

    get<TParams={}>(urlTemplate: string): HttpRequestConfigurator<TParams>;
    post<TParams={}>(urlTemplate: string): HttpRequestConfigurator<TParams>;
    put<TParams={}>(urlTemplate: string): HttpRequestConfigurator<TParams>;
    patch<TParams={}>(urlTemplate: string): HttpRequestConfigurator<TParams>;
    delete<TParams={}>(urlTemplate: string): HttpRequestConfigurator<TParams>;
}

export interface HttpRequestConfigurator<TParams> {
    jsonBody<TBody>(): HttpRequestConfiguratorWithBody<TBody, TParams>;
    formsBody<TBody>(): HttpRequestConfiguratorWithBody<TBody, TParams>;

    pre(prepareRequest: PrepareRequestFunction<TParams>): this;
    withFetch(customFetch: (request: Request, params: TParams) => Promise<Response>): this;

    resultFromJson<TResult, TError=any>(): HttpRequestBuilder<TParams, TResult, TError>;
}

export interface HttpRequestConfiguratorWithBody<TBody, TParams> {
    pre(prepareRequest: PrepareRequestWithBodyFunction<TBody, TParams>): this;
    withFetch(customFetch: (request: Request, params: TParams, body: TBody) => Promise<Response>): this;

    resultFromJson<TResult, TError=any>(): HttpRequestWithBodyBuilder<TBody, TParams, TResult, TError>;
}

export interface HttpRequestBuilder<TParams, TResult, TError> {
    build(): HttpRequest<TParams, TResult, TError>;
}

export interface HttpRequestWithBodyBuilder<TBody, TParams, TResult, TError> {
    build(): HttpRequestWithBody<TBody, TParams, TResult, TError>;
}