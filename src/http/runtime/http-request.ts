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
import { HttpRequest } from "../../index";
import { ReduxHttpRequestState, ReduxHttpInitialState } from "../api/http-request-redux";
import { Action } from "redux";

let counter = 1;


export function createHttpRequest<TBody, TParams, TResult, TError>(config: HttpRequestConfig<TBody, TParams, TResult, TError>): HttpRequestWithBody<TBody, TParams, TResult, TError> {
    const result = ((params: TParams, body: TBody): Promise<HttpResult<TResult, TError>> => {

        const url = urlFromParams(config.urlTemplate, config.appendRestOfParamsToQueryString, params);
        const request = (config.pre || []).reduce(
            (request, pre) => pre(request, params, body),
            new Request(url, {
                method: config.method
            }));

        const actualFetch: typeof config.fetch = config.fetch || ((request: Request, params: TParams, body: TBody) => fetch(request));
        const processResponse = config.processResponse || (defaultProcessResponseFactory(config));

        return actualFetch(request, params, body).then(
            response => processResponse(response, params, body),
            error => Promise.resolve<TransportErrorResult>({
                ok: false,
                errorType: "transport",
                reason: "fetch-rejected",
                error
            }));

    }) as any as HttpRequestWithBody<TBody, TParams, TResult, TError>;

    result.id = `${counter++}`;
    result.actions = createActions(result.id, config.method, config.urlTemplate);
    result.types = new HttpTypes<TBody, TParams, TResult, TError>();
    result.method = config.method;
    result.urlTemplate = config.urlTemplate;
    result.reducer = createReducer(result as any);

    return result;
}

function defaultProcessResponseFactory<TBody, TParams, TResult, TError>(config: HttpRequestConfig<TBody, TParams, TResult, TError>): typeof config.processResponse {
    const convertResult = config.convertResult || ((response: Response) => response.json());

    return (response: Response, params: TParams, body: TBody): Promise<HttpResult<TResult, TError>> => {
        if (response.ok || response.status === 400) {
            return convertResult(response.clone(), response.ok, params)
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
                            errorType: "response",
                            error: parsed as TError
                        };

                        return error;
                    }
                }, err => Promise.resolve<TransportErrorResult>({
                    ok: false,
                    errorType: "transport",
                    reason: "invalid-body",
                    statusCode: response.status,
                    error: err
                }));
        } else {
            if (response.status === 401 || response.status === 403) {
                const errorResult: AuthorizationErrorResult = {
                    ok: false,
                    errorType: "authorization",
                    status: response.status
                }

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
    }
}

function createReducer<TParams, TResult, TError>(httpRequest: HttpRequest<TParams, TResult, TError>):
    (state: ReduxHttpRequestState<TParams, TResult, TError>, action: Action) => ReduxHttpRequestState<TParams, TResult, TError> {

    return (state, action) => {
        if (!state) {
            state = {
                fetchState: "initial"
            } as ReduxHttpInitialState;
        }

        if (httpRequest.actions.isRunning(action)) {
            return {
                ...state,
                error: undefined,
                params: action.params,
                fetchState: "loading"
            } as any;
        }

        if (httpRequest.actions.isOk(action)) {
            return {
                ...state,
                error: undefined,
                data: action.result,
                params: action.params,
                fetchState: "successful"
            };
        }

        if (httpRequest.actions.isError(action)) {
            return {
                ...state,
                error: action,
                params: action.params,
                fetchState: "error"
            };
        }


        return state;
    };
}

class HttpTypes<TBody, TParams, TResult, TError> implements HttpRequestWithBodyTypes<TBody, TParams, TResult, TError> {
    get params(): TParams { throw new Error("Use this in Typescript typeof construct"); }
    get okResult(): TResult { throw new Error("Use this in Typescript typeof construct"); }
    get errorResult(): TError { throw new Error("Use this in Typescript typeof construct"); }
    get response(): HttpResult<TResult, TError> { throw new Error("Use this in Typescript typeof construct"); }
    get body(): TBody { throw new Error("Use this in Typescript typeof construct"); }
}