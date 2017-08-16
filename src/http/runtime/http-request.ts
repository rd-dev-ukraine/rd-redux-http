import {
    HttpResult,
    HttpRequestWithBody,
    HttpRequestWithBodyTypes,
    TransportErrorResult,
    OkResult,
    ErrorResponseResult,
    AuthorizationErrorResult,
    HttpRequestConfig
} from "../api";

import { urlFromParams } from "./url-builder";


export function createHttpRequest<TBody, TParams, TResult, TError>(config: HttpRequestConfig<TBody, TParams, TResult, TError>): HttpRequestWithBody<TBody, TParams, TResult, TError> {
    const result = ((params: TParams, body: TBody): Promise<HttpResult<TResult, TError>> => {

        const url = urlFromParams(config.urlTemplate, config.appendRestOfParamsToQueryString, params);
        const request = config.pre.reduce((request, pre) => pre(request, params, body), new Request(url));

        const actualFetch: typeof config.fetch = config.fetch || ((request: Request, params: TParams, body: TBody) => fetch(request));
        const processResponse = config.processResponse || (defaultProcessResponseFactory(config));

        return actualFetch(request, params, body).then(
            response => processResponse(response, params, body),
            error => Promise.resolve<TransportErrorResult>({
                ok: false,
                type: "transport",
                reason: "fetch-rejected",
                error
            }));

    }) as any as HttpRequestWithBody<TBody, TParams, TResult, TError>;

    result.types = new HttpTypes<TBody, TParams, TResult, TError>();

    return result;
}

function defaultProcessResponseFactory<TBody, TParams, TResult, TError>(config: HttpRequestConfig<TBody, TParams, TResult, TError>): typeof config.processResponse {
    const convertResult = config.convertResult || (
        (text: string) => new Promise<TResult | TError>((resolve, reject) => {
            try {
                const result = JSON.parse(text);

                resolve(result);
            } catch (e) {
                reject(e);
            }
        })
    );

    return (response: Response, params: TParams, body: TBody): Promise<HttpResult<TResult, TError>> => {
        if (response.ok || response.status === 400) {
            return response.clone()
                .text()
                .then(text => {
                    return convertResult(text)
                        .then(parsed => {
                            if (response.ok) {
                                const result: OkResult<TResult> = {
                                    ok: true,
                                    result: parsed as TResult
                                };

                                return result;
                            } else {
                                const error: ErrorResponseResult<TError> = {
                                    ok: false,
                                    type: "response",
                                    error: parsed as TError
                                };

                                return error;
                            }
                        }, err => Promise.resolve<TransportErrorResult>({
                            ok: false,
                            type: "transport",
                            reason: "invalid-body",
                            statusCode: response.status,
                            error: err
                        }));

                }, err => Promise.resolve<TransportErrorResult>({
                    ok: false,
                    type: "transport",
                    error: err,
                    reason: "invalid-body",
                    statusCode: response.status
                }));
        } else {
            if (response.status === 401 || response.status === 403) {
                const errorResult: AuthorizationErrorResult = {
                    ok: false,
                    type: "authorization",
                    status: response.status
                }

                return Promise.resolve(errorResult);

            } else {
                const errorResult: TransportErrorResult = {
                    ok: false,
                    type: "transport",
                    error: response.statusText,
                    reason: "other",
                    statusCode: response.status
                };

                return Promise.resolve(errorResult);
            }
        }
    }
}

class HttpTypes<TBody, TParams, TResult, TError> implements HttpRequestWithBodyTypes<TBody, TParams, TResult, TError> {
    get params(): TParams { throw new Error("Use this in Typescript typeof construct"); }
    get result(): TResult { throw new Error("Use this in Typescript typeof construct"); }
    get error(): TError { throw new Error("Use this in Typescript typeof construct"); }
    get response(): HttpResult<TResult, TError> { throw new Error("Use this in Typescript typeof construct"); }
    get body(): TBody { throw new Error("Use this in Typescript typeof construct"); }
}