import { Action } from "redux";
import { ReduxHttpFetchResultConfig, ReduxHttpTransportError, ReduxHttpErrorResult, ReduxHttpOkResult, ReduxHttpFetchRequestFactory, ReduxHttpFetchRequestAction, ReduxHttpFetchRequestWithBodyFactory, ReduxHttpFetchRequestWithBodyAction, ReduxHttpActionBase } from "./api";
export declare type PrepareRequestFunction = (request: RequestInit, params: any, body?: any) => RequestInit;
export declare type ProcessResponse<TResult, TError> = (response: Response) => Promise<TResult | TError>;
export declare type FetchInterceptor = (request: Request) => Promise<Response>;
export interface FetchRequestConfiguration {
    method: string;
    url: string;
    pre: PrepareRequestFunction[];
    fetch: FetchInterceptor;
}
export declare class ReduxHttpResultActionTypeGuard<TParams, TResult, TError> implements ReduxHttpFetchResultConfig<TParams, TResult, TError> {
    protected asyncWorkerId: string;
    constructor(asyncWorkerId: string);
    isResult(action: Action): action is ReduxHttpErrorResult<TParams, TError> | ReduxHttpOkResult<TParams, TResult>;
    isOk(action: Action): action is ReduxHttpOkResult<TParams, TResult>;
    isError(action: Action): action is ReduxHttpTransportError<TParams> | ReduxHttpErrorResult<TParams, TError>;
    isHttpTransportError(action: Action): action is ReduxHttpTransportError<TParams>;
    isAuthorizationError(action: Action): action is ReduxHttpTransportError<TParams>;
    isResultError(action: Action): action is ReduxHttpErrorResult<TParams, TError>;
    private isOwnAction(action);
}
export declare abstract class ReduxHttpFetchRequestBase<TParams, TResult, TError> extends ReduxHttpResultActionTypeGuard<TParams, TResult, TError> implements ReduxHttpFetchResultConfig<TParams, TResult, TError> {
    private configuration;
    protected asyncWorkerId: string;
    constructor(configuration: FetchRequestConfiguration);
    private createWorker(configuration);
    private defaultResultProcessor(result, action, params, body?);
    protected isRunningCore(action: Action): boolean;
}
export declare class ReduxHttpFetchRequestWithParams<TParams, TResult, TError> extends ReduxHttpFetchRequestBase<TParams, TResult, TError> implements ReduxHttpFetchRequestFactory<TParams> {
    run(params: TParams): ReduxHttpFetchRequestAction<TParams>;
    isRunning(action: Action): action is ReduxHttpFetchRequestAction<TParams>;
    isMy(action: Action): action is ReduxHttpActionBase<TParams>;
}
export declare class ReduxHttpFetchRequestWithBody<TParams, TBody, TResult, TError> extends ReduxHttpFetchRequestBase<TParams, TResult, TError> implements ReduxHttpFetchRequestWithBodyFactory<TParams, TBody> {
    run(params: TParams, body: TBody): ReduxHttpFetchRequestWithBodyAction<TParams, TBody>;
    isRunning(action: Action): action is ReduxHttpFetchRequestWithBodyAction<TParams, TBody>;
    isMy(action: Action): action is ReduxHttpActionBase<TParams>;
}
