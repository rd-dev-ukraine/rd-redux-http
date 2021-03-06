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

import { createActions } from "./actions";
import { urlFromParams } from "./url-builder";
import { ReduxHttpRequestState } from "../../redux/http-request-redux";

let counter = 1;

export function createHttpRequest<TBody, TParams, TResult, TError>(
    config: HttpRequestConfig<TBody, TParams, TResult, TError>
): HttpRequestWithBody<TBody, TParams, TResult, TError> {
    const result = (((params: TParams, body: TBody): Promise<HttpResult<TResult, TError>> => {
        params = config.prepareParams ? config.prepareParams(params) : params;

        const url = urlFromParams(config.urlTemplate, config.appendRestOfParamsToQueryString, params);

        return url.then(url => {
            const request = (config.pre || []).reduce(
                (request, pre) => pre(request, params, body),
                new Request(url, {
                    method: config.method
                })
            );

            const actualFetch: typeof config.fetch =
                config.fetch || ((request: Request, params: TParams, body: TBody) => fetch(request));
            const processResponse = config.processResponse || defaultProcessResponseFactory(config);

            const postProcessResult: (
                params: TParams,
                result: HttpResult<TResult, TError>
            ) => Promise<HttpResult<any, any>> = (params, result) =>
                reduceAsync(config.post || [], (fn, prevResult) => fn(prevResult, params), result);

            return actualFetch(request, params, body)
                .then(
                    response => processResponse(response, params, body),
                    error =>
                        Promise.resolve<TransportErrorResult>({
                            ok: false,
                            errorType: "transport",
                            reason: "fetch-rejected",
                            error
                        })
                )
                .then(r => postProcessResult(params, r));
        });
    }) as any) as HttpRequestWithBody<TBody, TParams, TResult, TError>;

    result.id = `${counter++}`;
    result.actions = createActions(result.id, config.method, config.urlTemplate, config.name);
    result.types = new HttpTypes<TBody, TParams, TResult, TError>();
    result.method = config.method;
    result.urlTemplate = config.urlTemplate;
    result.requestName = config.name;

    return result;
}

function defaultProcessResponseFactory<TBody, TParams, TResult, TError>(
    config: HttpRequestConfig<TBody, TParams, TResult, TError>
): typeof config.processResponse {
    const convertResult: any = config.convertResult || ((response: Response) => response.clone().json());

    return (response: Response, params: TParams, body: TBody): Promise<HttpResult<TResult, TError>> => {
        if (response.ok || response.status === 400) {
            return convertResult(response.clone(), response.ok, params).then(
                (parsed: any) => {
                    if (response.ok) {
                        const result: OkResult<TResult> = {
                            ok: true,
                            result: parsed as TResult
                        };

                        return result;
                    } else {
                        const error: ErrorResponseResult<TError> = {
                            ok: false,
                            errorType: "response",
                            error: parsed as TError
                        };

                        return error;
                    }
                },
                (err: any) =>
                    Promise.resolve<TransportErrorResult>({
                        ok: false,
                        errorType: "transport",
                        reason: "invalid-body",
                        statusCode: response.status,
                        error: err
                    })
            );
        } else {
            if (response.status === 401 || response.status === 403) {
                const errorResult: AuthorizationErrorResult = {
                    ok: false,
                    errorType: "authorization",
                    status: response.status
                };

                return Promise.resolve(errorResult);
            } else {
                const errorResult: TransportErrorResult = {
                    ok: false,
                    errorType: "transport",
                    error: response.statusText,
                    reason: "other",
                    statusCode: response.status
                };

                return Promise.resolve(errorResult);
            }
        }
    };
}

class HttpTypes<TBody, TParams, TResult, TError> implements HttpRequestWithBodyTypes<TBody, TParams, TResult, TError> {
    get params(): TParams {
        throw new Error("Use this in Typescript typeof expression only.");
    }
    get okResult(): TResult {
        throw new Error("Use this in Typescript typeof expression only.");
    }
    get errorResult(): TError {
        throw new Error("Use this in Typescript typeof expression only.");
    }
    get response(): HttpResult<TResult, TError> {
        throw new Error("Use this in Typescript typeof expression only.");
    }
    get body(): TBody {
        throw new Error("Use this in Typescript typeof construct");
    }
    get reduxState(): ReduxHttpRequestState<TParams, TResult, TError> {
        throw new Error("Use this in Typescript typeof expression only.");
    }
}

async function reduceAsync<T extends (...args: any[]) => Promise<any>>(
    src: T[],
    runItem: (currentItem: T, prevResult: any) => Promise<any>,
    initialResult: any = undefined
) {
    for (const currentItem of src) {
        initialResult = await runItem(currentItem, initialResult);
    }

    return initialResult;
}
