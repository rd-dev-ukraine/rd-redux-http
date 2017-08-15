import { Action } from "redux";

/**
 * @module
 *
 * There are few types of requests:
 * - Custom request (executes function with predefined parameters which returns Promise)
 * - Fetch request (executes HTTP request via `fetch`)
 * -- Requests with parameters only:  GET/HEAD/OPTIONS/etc., accepts parameters and substitutes URL placeholders and serializes rest to query string.
 * -- POST/PUT/etc. action which accepts parameters and optional body.
 *
 *
 * Request configuration object is entry point for operating with the requests.
 * Each request configuration represents request of single resource (either calling async function or execute a HTTP request via `fetch`).
 *
 * Request configuration allows to create actions which dispatching runs a request.
 * Also it allows to determine special actions dispatched on starting request and on request result.
 * */

/**
 * Base redux-http action with parameters.
 * Can be either custom action (params is parameters for custom function) or fetch HTTP request (params is URL and Query string parameters).
 */
export interface ReduxHttpActionBase<TParams> extends Action {
    /**
     * Custom request or URL and Query string parameters.
     */
    params: TParams;
}

/**
 * Action which executes custom function.
 */
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

    /** True if error is caused by HTTP infrastructure, false if request executed successfully but contains error in body. */
    isHttpError: false;

    errors: TError;

    /** The action caused error. Re-dispatch it to retry executing. */
    request: ReduxHttpCustomRequestAction<any>;
}

export interface ReduxHttpTransportError<TParams> extends ReduxHttpActionBase<TParams> {
    ok: false;
    isHttpError: true;
    isAuthorizationError: boolean;
    status: number | undefined  ;
    errors: HttpError;
    request: ReduxHttpCustomRequestAction<any>;
}

export interface HttpError {
    error: "Not authorized" | "Status Code" | "Transport Error";
    details: string;
}

/**
 * An entry point for redux-http functionality.
 * Represents single async operation (usually HTTP request) which can run by dispatching action created with special method.
 */
export interface ReduxHttpResultConfig<TParams, TResult, TError> {
    /**
     * Type guard which passes if action is result of async operation initiated by the configuration.
     */
    isResult(action: Action): action is (ReduxHttpOkResult<TParams, TResult> | ReduxHttpErrorResult<TParams, TError>);

    /**
     * Type guard which passes if action is successful result of async operation initiated by the configuration.
     */
    isOk(action: Action): action is ReduxHttpOkResult<TParams, TResult>;
}

export interface ReduxHttpCustomRequestResultConfig<TParams, TResult, TError> extends ReduxHttpResultConfig<TParams, TResult, TError> {
    /**
     * Type guard which passes if action is error result of async operation initiated by the configuration.
     */
    isError(action: Action): action is ReduxHttpErrorResult<TParams, TError>;
}

export interface ReduxHttpFetchResultConfig<TParams, TResult, TError> extends ReduxHttpResultConfig<TParams, TResult, TError> {
    /**
     * Type guard which passes if action is error result of async operation initiated by the configuration.
     */
    isError(action: Action): action is (ReduxHttpErrorResult<TParams, TError> | ReduxHttpTransportError<TParams>);

    isHttpTransportError(action: Action): action is ReduxHttpTransportError<TParams>;

    /**
     * Type guard for action which represents error returned from backend (i.e. business logic error, not HTTP error).
     */
    isResultError(action: Action): action is ReduxHttpErrorResult<TParams, TError>;

    /**
     * Type guard which passes when request has been completed with Not Authorized status.
     */
    isAuthorizationError(action: Action): action is ReduxHttpTransportError<TParams>;
}

export interface ReduxHttpCustomRequestFactory<TParams> {
    /**
     * Creates action which will run configured custom function with specified params on dispatching.
     */
    run(params: TParams): ReduxHttpCustomRequestAction<TParams>;

    /**
     * Type guard which passes for actions produced by this factory.
     */
    isRunning(action: Action): action is ReduxHttpCustomRequestAction<TParams>;

    isMy(action: Action): action is ReduxHttpActionBase<TParams>;
}

/**
 * Factory for HTTP request with params without body.
 */
export interface ReduxHttpFetchRequestFactory<TParams> {
    /**
     * Creates action which will run fetch HTTP request with specified params on dispatching.
     */
    run(params: TParams): ReduxHttpFetchRequestAction<TParams>;

    /**
     * Type guard which passes for actions produced by this factory.
     */
    isRunning(action: Action): action is ReduxHttpFetchRequestAction<TParams>;

    isMy(action: Action): action is ReduxHttpActionBase<TParams>;
}

/**
 * Factory for fetch HTTP request actions with params and body.
 */
export interface ReduxHttpFetchRequestWithBodyFactory<TParams, TBody> {
    /**
     * Creates action which will run fetch HTTP request with params and body on dispatching.
     */
    run(params: TParams, body: TBody): ReduxHttpFetchRequestWithBodyAction<TParams, TBody>;

    /**
     * Type guard which passes for actions produced by this factory.
     */
    isRunning(action: Action): action is ReduxHttpFetchRequestWithBodyAction<TParams, TBody>;

    isMy(action: Action): action is ReduxHttpActionBase<TParams>;
}