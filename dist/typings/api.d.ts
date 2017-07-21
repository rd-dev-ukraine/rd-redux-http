import { Action } from "redux";
export interface ReduxHttpActionBase<TParams> extends Action {
    params: TParams;
}
export interface ReduxHttpCustomRequestAction<TParams> extends ReduxHttpActionBase<TParams> {
}
export interface ReduxHttpFetchRequestAction<TParams> extends ReduxHttpActionBase<TParams> {
}
export interface ReduxHttpFetchRequestWithBodyAction<TParams, TBody> extends ReduxHttpFetchRequestAction<TParams> {
    body: TBody;
}
export interface ReduxHttpOkResult<TParams, TResult> extends ReduxHttpActionBase<TParams> {
    ok: true;
    result: TResult;
}
export interface ReduxHttpErrorResult<TParams, TError> extends ReduxHttpActionBase<TParams> {
    ok: false;
    isHttpError: false;
    errors: TError;
    request: ReduxHttpCustomRequestAction<any>;
}
export interface ReduxHttpTransportError<TParams> extends ReduxHttpActionBase<TParams> {
    ok: false;
    isHttpError: true;
    isAuthorizationError: boolean;
    status: number | undefined;
    errors: HttpError;
    request: ReduxHttpCustomRequestAction<any>;
}
export interface HttpError {
    error: "Not authorized" | "Status Code" | "Transport Error";
    details: string;
}
export interface ReduxHttpResultConfig<TParams, TResult, TError> {
    isResult(action: Action): action is (ReduxHttpOkResult<TParams, TResult> | ReduxHttpErrorResult<TParams, TError>);
    isOk(action: Action): action is ReduxHttpOkResult<TParams, TResult>;
}
export interface ReduxHttpCustomRequestResultConfig<TParams, TResult, TError> extends ReduxHttpResultConfig<TParams, TResult, TError> {
    isError(action: Action): action is ReduxHttpErrorResult<TParams, TError>;
}
export interface ReduxHttpFetchResultConfig<TParams, TResult, TError> extends ReduxHttpResultConfig<TParams, TResult, TError> {
    isError(action: Action): action is (ReduxHttpErrorResult<TParams, TError> | ReduxHttpTransportError<TParams>);
    isHttpTransportError(action: Action): action is ReduxHttpTransportError<TParams>;
    isResultError(action: Action): action is ReduxHttpErrorResult<TParams, TError>;
    isAuthorizationError(action: Action): action is ReduxHttpTransportError<TParams>;
}
export interface ReduxHttpCustomRequestFactory<TParams> {
    run(params: TParams): ReduxHttpCustomRequestAction<TParams>;
    isRunning(action: Action): action is ReduxHttpCustomRequestAction<TParams>;
    isMy(action: Action): action is ReduxHttpActionBase<TParams>;
}
export interface ReduxHttpFetchRequestFactory<TParams> {
    run(params: TParams): ReduxHttpFetchRequestAction<TParams>;
    isRunning(action: Action): action is ReduxHttpFetchRequestAction<TParams>;
    isMy(action: Action): action is ReduxHttpActionBase<TParams>;
}
export interface ReduxHttpFetchRequestWithBodyFactory<TParams, TBody> {
    run(params: TParams, body: TBody): ReduxHttpFetchRequestWithBodyAction<TParams, TBody>;
    isRunning(action: Action): action is ReduxHttpFetchRequestWithBodyAction<TParams, TBody>;
    isMy(action: Action): action is ReduxHttpActionBase<TParams>;
}
