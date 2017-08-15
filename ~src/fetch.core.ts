import { Action } from "redux";

import { buildReduxHttpActionType, fetchTypeGuard, parseReduxHttpActionType } from "./action-helpers";

import {
    ReduxHttpFetchResultConfig,
    ReduxHttpTransportError,
    ReduxHttpErrorResult,
    ReduxHttpOkResult,
    ReduxHttpFetchRequestFactory,
    ReduxHttpFetchRequestAction,
    ReduxHttpFetchRequestWithBodyFactory,
    ReduxHttpFetchRequestWithBodyAction,
    ReduxHttpActionBase
} from "./api";

import { registerAsyncWorker, WorkerFunction } from "./async-workers-registry";

export type PrepareRequestFunction = (request: RequestInit, params: any, body?: any) => RequestInit;

export type ProcessResponse<TResult, TError> = (response: Response) => Promise<TResult | TError>;

export type FetchInterceptor = (request: Request) => Promise<Response>;

/** Configuration of fetch request to be fulfilled with fluent interface.  */
export interface FetchRequestConfiguration {
    method: string;
    url: string;

    pre: PrepareRequestFunction[];
    fetch: FetchInterceptor;
}

export class ReduxHttpResultActionTypeGuard<TParams, TResult, TError> implements ReduxHttpFetchResultConfig<TParams, TResult, TError> {
    constructor(protected asyncWorkerId: string) {
        if (!asyncWorkerId) {
            throw new Error("Async Worker ID is not defined.");
        }
    }

    isResult(action: Action): action is ReduxHttpErrorResult<TParams, TError> | ReduxHttpOkResult<TParams, TResult> {
        return fetchTypeGuard.isResult(action) && this.isOwnAction(action);
    }

    isOk(action: Action): action is ReduxHttpOkResult<TParams, TResult> {
        return fetchTypeGuard.isOk(action) && this.isOwnAction(action);
    }

    isError(action: Action): action is ReduxHttpTransportError<TParams> | ReduxHttpErrorResult<TParams, TError> {
        return fetchTypeGuard.isError(action) && this.isOwnAction(action);
    }

    isHttpTransportError(action: Action): action is ReduxHttpTransportError<TParams> {
        return fetchTypeGuard.isHttpTransportError(action) && this.isOwnAction(action);
    }

    isAuthorizationError(action: Action): action is ReduxHttpTransportError<TParams> {
        return fetchTypeGuard.isAuthorizationError(action) && this.isOwnAction(action);
    }

    isResultError(action: Action): action is ReduxHttpErrorResult<TParams, TError> {
        return fetchTypeGuard.isResultError(action) && this.isOwnAction(action);
    }

    private isOwnAction(action: Action): boolean {
        if (!action || !action.type) {
            return false;
        }

        const info = parseReduxHttpActionType(`${action.type}`);

        return info.isReduxHttpAction && info.asyncWorkerId === this.asyncWorkerId;
    }
}

export abstract class ReduxHttpFetchRequestBase<TParams, TResult, TError> extends ReduxHttpResultActionTypeGuard<TParams, TResult, TError> implements
    ReduxHttpFetchResultConfig<TParams, TResult, TError> {
    protected asyncWorkerId: string;

    constructor(private configuration: FetchRequestConfiguration) {
        super(`${configuration.method} ${configuration.url}`);

        if (!configuration) {
            throw new Error("Configuration is not defined.");
        }

        registerAsyncWorker(this.asyncWorkerId, this.createWorker(this.configuration));
    }


    private createWorker(configuration: FetchRequestConfiguration): WorkerFunction {
        return (action: ReduxHttpFetchRequestAction<any>): Promise<ReduxHttpOkResult<TParams, TResult> | ReduxHttpErrorResult<TParams, TError> | ReduxHttpTransportError<TParams>> => {
            const { params, body } = action as any;

            const request: RequestInit = (configuration.pre || []).reduce<RequestInit>((r, pre) => pre(r, params, body), {
                method: configuration.method
            } as RequestInit);

            const actualFetch =  ("fetch" in window) ? window.fetch : configuration.fetch;
            const runResult = actualFetch(new Request((request as any).url, request));

            return this.defaultResultProcessor(runResult, action, params, body);
        };
    }

    private defaultResultProcessor(result: Promise<Response>, action: ReduxHttpFetchRequestAction<any>, params: TParams, body?: any):
        Promise<ReduxHttpOkResult<TParams, TResult> | ReduxHttpErrorResult<TParams, TError> | ReduxHttpTransportError<TParams>> {
        return result.then<ReduxHttpOkResult<TParams, TResult> | ReduxHttpErrorResult<TParams, TError> | ReduxHttpTransportError<TParams>, any>((response: Response) => {
            if (response.ok || response.status === 400) {
                return response.clone().json()
                    .then<ReduxHttpOkResult<TParams, TResult> | ReduxHttpErrorResult<TParams, TError>>(result => {

                        if (response.ok) {
                            const okResult: ReduxHttpOkResult<TParams, TResult> = {
                                type: buildReduxHttpActionType(true, this.asyncWorkerId),
                                ok: true,
                                params,
                                result: result as TResult
                            };

                            return okResult;
                        } else {
                            const errorResult: ReduxHttpErrorResult<TParams, TError> = {
                                type: buildReduxHttpActionType(true, this.asyncWorkerId),
                                ok: false,
                                errors: result as TError,
                                isHttpError: false,
                                request: action,
                                params
                            };

                            return errorResult;
                        }
                    })
                    .catch(async (err) => {
                        const errorResult: ReduxHttpErrorResult<TParams, TError> = {
                            type: buildReduxHttpActionType(true, this.asyncWorkerId),
                            ok: false,
                            errors: await response.clone().text().then(res => res) as any,
                            isHttpError: false,
                            request: action,
                            params
                        };

                        return errorResult;
                    });
            } else {
                const error: ReduxHttpTransportError<TParams> = {
                    type: buildReduxHttpActionType(true, this.asyncWorkerId),
                    ok: false,
                    isHttpError: true,
                    isAuthorizationError: response.status === 401,
                    status: response.status,
                    errors: {
                        error: response.status === 401 ? "Not authorized" : "Status Code",
                        details: response.statusText
                    },
                    request: action,
                    params
                };

                return error;
            }
        }, (err: Error) => {
            const error: ReduxHttpTransportError<TParams> = {
                type: buildReduxHttpActionType(true, this.asyncWorkerId),
                ok: false,
                isHttpError: true,
                isAuthorizationError: false,
                status: undefined,
                errors: {
                    error: "Transport Error",
                    details: `${err}`
                },
                request: action,
                params
            };

            return Promise.resolve(error);
        });
    }

    protected isRunningCore(action: Action): boolean {
        if (!action || !action.type) {
            return false;
        }

        const info = parseReduxHttpActionType(`${action.type}`);
        if (info.isReduxHttpAction) {
            return !info.isResult && info.asyncWorkerId === this.asyncWorkerId;
        }

        return false;
    }
}

export class ReduxHttpFetchRequestWithParams<TParams, TResult, TError> extends ReduxHttpFetchRequestBase<TParams, TResult, TError> implements
    ReduxHttpFetchRequestFactory<TParams> {
    run(params: TParams): ReduxHttpFetchRequestAction<TParams> {
        return {
            type: buildReduxHttpActionType(false, this.asyncWorkerId),
            params
        };
    }

    isRunning(action: Action): action is ReduxHttpFetchRequestAction<TParams> {
        return this.isRunningCore(action);
    }

    isMy(action: Action): action is ReduxHttpActionBase<TParams> {
        if (action && action.type) {
            const info = parseReduxHttpActionType(action.type);
            return info.isReduxHttpAction && info.asyncWorkerId === this.asyncWorkerId;
        }

        return false;
    }
}

export class ReduxHttpFetchRequestWithBody<TParams, TBody, TResult, TError> extends ReduxHttpFetchRequestBase<TParams, TResult, TError> implements
    ReduxHttpFetchRequestWithBodyFactory<TParams, TBody> {
    run(params: TParams, body: TBody): ReduxHttpFetchRequestWithBodyAction<TParams, TBody> {
        return {
            type: buildReduxHttpActionType(false, this.asyncWorkerId),
            params,
            body
        };
    }

    isRunning(action: Action): action is ReduxHttpFetchRequestWithBodyAction<TParams, TBody> {
        return this.isRunningCore(action);
    }

    isMy(action: Action): action is ReduxHttpActionBase<TParams> {
        if (action && action.type) {
            const info = parseReduxHttpActionType(action.type);
            return info.isReduxHttpAction && info.asyncWorkerId === this.asyncWorkerId;
        }

        return false;
    }
}