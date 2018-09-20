import * as querystring from "querystring";

import {
    HttpRequestEntryPoint,
    HttpRequestConfigurator,
    HttpRequestConfiguratorWithBody,
    HttpRequestBuilder,
    PrepareRequestFunction,
    PrepareRequestWithBodyFunction,
    HttpRequestConfig,
    HttpRequestWithBodyBuilder,
    HttpRequest,
    HttpRequestWithBody,
    HttpResult,
    UrlTemplate
} from "../api";

import { createHttpRequest } from "../runtime";

class EntryPoint implements HttpRequestEntryPoint {
    fetch<TParams = {}>(
        method: string,
        urlTemplate: UrlTemplate<TParams>,
        appendRestOfParamsToQueryString = false,
        name: string = ""
    ): HttpRequestConfigurator<TParams> {
        if (!method) {
            throw new Error("HTTP verb is not defined.");
        }
        if (!urlTemplate) {
            throw new Error("URL template is not defined.");
        }

        const config: HttpRequestConfig<any, TParams, any, any> = {
            method,
            name,
            urlTemplate,
            appendRestOfParamsToQueryString,

            convertResult: undefined,
            fetch: undefined,
            pre: [],
            processResponse: undefined as any
        };

        return new RequestConfigurator<TParams>(config);
    }

    get<TParams = {}>(
        urlTemplate: UrlTemplate<TParams>,
        appendRestOfParamsToQueryString = false,
        name = ""
    ): HttpRequestConfigurator<TParams> {
        return this.fetch("GET", urlTemplate, appendRestOfParamsToQueryString, name);
    }

    post<TParams = {}>(
        urlTemplate: UrlTemplate<TParams>,
        appendRestOfParamsToQueryString = false,
        name = ""
    ): HttpRequestConfigurator<TParams> {
        return this.fetch("POST", urlTemplate, appendRestOfParamsToQueryString, name);
    }

    put<TParams = {}>(
        urlTemplate: UrlTemplate<TParams>,
        appendRestOfParamsToQueryString = false,
        name = ""
    ): HttpRequestConfigurator<TParams> {
        return this.fetch("PUT", urlTemplate, appendRestOfParamsToQueryString, name);
    }

    patch<TParams = {}>(
        urlTemplate: UrlTemplate<TParams>,
        appendRestOfParamsToQueryString = false,
        name = ""
    ): HttpRequestConfigurator<TParams> {
        return this.fetch("PATCH", urlTemplate, appendRestOfParamsToQueryString, name);
    }

    delete<TParams = {}>(
        urlTemplate: UrlTemplate<TParams>,
        appendRestOfParamsToQueryString = false,
        name = ""
    ): HttpRequestConfigurator<TParams> {
        return this.fetch("DELETE", urlTemplate, appendRestOfParamsToQueryString, name);
    }
}

class RequestConfigurator<TParams> implements HttpRequestConfigurator<TParams> {
    constructor(private config: HttpRequestConfig<any, TParams, any, any>) {
        if (!config) {
            throw new Error("Configuration object is missing.");
        }
    }

    jsonBody<TBody>(): HttpRequestConfiguratorWithBody<TBody, TParams> {
        const configurator = new RequestWithBodyConfigurator<TBody, TParams>(this.config);

        return configurator.pre((request, params, body) => {
            const requestInit: RequestInit = {
                headers: {
                    "Content-Type": "application/json"
                },
                body: body ? JSON.stringify(body) : undefined
            };

            return new Request(request, requestInit);
        });
    }

    formsBody<TBody>(): HttpRequestConfiguratorWithBody<TBody, TParams> {
        const configurator = new RequestWithBodyConfigurator<TBody, TParams>(this.config);

        return configurator.pre((request, params, body) => {
            const requestInit: RequestInit = {
                headers: {
                    "Content-Type": "application/x-form-urlencoded"
                },
                body: body ? querystring.stringify(body) : undefined
            };

            return new Request(request, requestInit);
        });
    }

    customBody<TBody>(): HttpRequestConfiguratorWithBody<TBody, TParams> {
        return new RequestWithBodyConfigurator<TBody, TParams>(this.config);
    }

    pre(prepareRequest: PrepareRequestFunction<TParams>): this {
        if (!prepareRequest) {
            throw new Error("Prepare request function is not defined.");
        }

        this.config.pre.push(prepareRequest);

        return this;
    }

    prepareParams(paramsConverter: (params: TParams) => any): this {
        if (!paramsConverter) {
            throw new Error("Params converter is not defined");
        }

        this.config.prepareParams = paramsConverter;

        return this;
    }

    withFetch(customFetch: (request: Request, params: TParams) => Promise<Response>): this {
        if (!customFetch) {
            throw new Error("Custom fetch function is not defined.");
        }
        this.config.fetch = customFetch;
        return this;
    }

    processResponse<TResult, TError>(
        processor: (response: Response, params: TParams) => Promise<HttpResult<TResult, TError>>
    ): HttpRequestBuilder<TParams, TResult, TError> {
        if (!processor) {
            throw new Error("Processor function is not defined.");
        }

        this.config.processResponse = processor;

        return new RequestBuilder<TParams, TResult, TError>(this.config);
    }

    resultFromJson<TResult, TError>(): HttpRequestBuilder<TParams, TResult, TError> {
        return new RequestBuilder<TParams, TResult, TError>(this.config);
    }

    convertResult<TResult, TError = any>(
        converter: (response: Response, isError: boolean, params: TParams) => Promise<TResult | TError>
    ): HttpRequestBuilder<TParams, TResult, TError> {
        if (!converter) {
            throw new Error("Coversion function is not defined.");
        }

        this.config.convertResult = converter;

        return new RequestBuilder<TParams, TResult, TError>(this.config);
    }
}

class RequestWithBodyConfigurator<TBody, TParams> implements HttpRequestConfiguratorWithBody<TBody, TParams> {
    constructor(private config: HttpRequestConfig<TBody, TParams, any, any>) {
        if (!config) {
            throw new Error("Configuration object is missing.");
        }
    }

    pre(prepareRequest: PrepareRequestWithBodyFunction<TBody, TParams>): this {
        if (!prepareRequest) {
            throw new Error("Prepare request function is not defined.");
        }

        this.config.pre.push(prepareRequest);

        return this;
    }

    withFetch(customFetch: (request: Request, params: TParams, body: TBody) => Promise<Response>): this {
        if (!customFetch) {
            throw new Error("Custom fetch function is not defined.");
        }
        this.config.fetch = customFetch;
        return this;
    }

    processResponse<TResult, TError>(
        processor: (response: Response, params: TParams, body: TBody) => Promise<HttpResult<TResult, TError>>
    ): HttpRequestWithBodyBuilder<TBody, TParams, TResult, TError> {
        if (!processor) {
            throw new Error("Processor function is not defined.");
        }

        this.config.processResponse = processor;

        return new RequestWithBodyBuilder<TBody, TParams, TResult, TError>(this.config);
    }

    resultFromJson<TResult, TError>(): HttpRequestWithBodyBuilder<TBody, TParams, TResult, TError> {
        return new RequestWithBodyBuilder<TBody, TParams, TResult, TError>(this.config);
    }

    convertResult<TResult, TError = any>(
        converter: (response: Response, isError: boolean, params: TParams) => Promise<TResult | TError>
    ): HttpRequestWithBodyBuilder<TBody, TParams, TResult, TError> {
        if (!converter) {
            throw new Error("Coversion function is not defined.");
        }

        this.config.convertResult = converter;

        return new RequestWithBodyBuilder<TBody, TParams, TResult, TError>(this.config);
    }
}

class RequestBuilder<TParams, TResult, TError> implements HttpRequestBuilder<TParams, TResult, TError> {
    constructor(private config: HttpRequestConfig<undefined, TParams, TResult, TError>) {
        if (!config) {
            throw new Error("Configuration object is missing.");
        }
    }

    build(): HttpRequest<TParams, TResult, TError> {
        return createHttpRequest<undefined, TParams, TResult, TError>(this.config) as any;
    }
}

class RequestWithBodyBuilder<TBody, TParams, TResult, TError>
    implements HttpRequestWithBodyBuilder<TBody, TParams, TResult, TError> {
    constructor(private config: HttpRequestConfig<TBody, TParams, TResult, TError>) {
        if (!config) {
            throw new Error("Configuration object is missing.");
        }
    }

    build(): HttpRequestWithBody<TBody, TParams, TResult, TError> {
        return createHttpRequest<TBody, TParams, TResult, TError>(this.config as any) as any;
    }
}

/**
 * Start configuring HTTP request from here.
 */
export const http: HttpRequestEntryPoint = new EntryPoint();
