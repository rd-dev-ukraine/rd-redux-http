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
    convertResult?: (response: Response, isError: boolean, params: TParams) => Promise<TResult | TError>;
}

// Entry point for fluent request configuration
export interface HttpRequestEntryPoint {

    /**
     * Creates request with custom method (verb) and URL template.
     * @param method HTTP verb for new request.
     * @param urlTemplate Url template with parameters (defined as :parameterName).
     * @param [appendRestOfParamsToQueryString] If true than all parameters are not used in URL will be append as name-values pairs to query string.
     *
     * @returns An object allows to continue configuring HTTP request.
     */
    fetch<TParams={}>(method: string, urlTemplate: string, appendRestOfParamsToQueryString?: boolean): HttpRequestConfigurator<TParams>;

    /**
     * Creates GET request.
     * @param urlTemplate Url template with parameters (defined as :parameterName).
     * @param [appendRestOfParamsToQueryString] If true than all parameters are not used in URL will be append as name-values pairs to query string.
     *
     * @returns An object allows to continue configuring HTTP request.s
     */
    get<TParams={}>(urlTemplate: string, appendRestOfParamsToQueryString?: boolean): HttpRequestConfigurator<TParams>;

    /**
     * Creates POST request.
     * @param urlTemplate Url template with parameters (defined as :parameterName).
     * @param [appendRestOfParamsToQueryString] If true than all parameters are not used in URL will be append as name-values pairs to query string.
     *
     * @returns An object allows to continue configuring HTTP request.s
     */
    post<TParams={}>(urlTemplate: string, appendRestOfParamsToQueryString?: boolean): HttpRequestConfigurator<TParams>;

    /**
     * Creates PUT request.
     * @param urlTemplate Url template with parameters (defined as :parameterName).
     * @param [appendRestOfParamsToQueryString] If true than all parameters are not used in URL will be append as name-values pairs to query string.
     *
     * @returns An object allows to continue configuring HTTP request.s
     */
    put<TParams={}>(urlTemplate: string, appendRestOfParamsToQueryString?: boolean): HttpRequestConfigurator<TParams>;

    /**
     * Creates PATCH request.
     * @param urlTemplate Url template with parameters (defined as :parameterName).
     * @param [appendRestOfParamsToQueryString] If true than all parameters are not used in URL will be append as name-values pairs to query string.
     *
     * @returns An object allows to continue configuring HTTP request.s
     */
    patch<TParams={}>(urlTemplate: string, appendRestOfParamsToQueryString?: boolean): HttpRequestConfigurator<TParams>;

    /**
     * Creates DELETE request.
     * @param urlTemplate Url template with parameters (defined as :parameterName).
     * @param [appendRestOfParamsToQueryString] If true than all parameters are not used in URL will be append as name-values pairs to query string.
     *
     * @returns An object allows to continue configuring HTTP request.s
     */
    delete<TParams={}>(urlTemplate: string, appendRestOfParamsToQueryString?: boolean): HttpRequestConfigurator<TParams>;
}

/**
 * Allows to configure HTTP request.
 */
export interface HttpRequestConfigurator<TParams> {
    /**
     * Configures request as request with JSON body.
     *
     * @param TBody Type of the body.
     * @returns An object allows to configure request with body.
     */
    jsonBody<TBody>(): HttpRequestConfiguratorWithBody<TBody, TParams>;

    /**
     * Configures request as request with url-encoded name-value pairs body.
     *
     * @param TBody Type of the body.
     * @returns An object allows to configure request with body.
     */
    formsBody<TBody>(): HttpRequestConfiguratorWithBody<TBody, TParams>;

    /**
     * Continue configuration of request as request with body.
     *
     * IMPORTANT: This methods doesn't add any body processing logic.
     * You need to add it yourself by using pre() method.
     *
     * @returns An object allows to configure request with body.
     */
    customBody<TBody>(): HttpRequestConfiguratorWithBody<TBody, TParams>;

    /**
     * Adds a function which modifies Request object before running it.
     * Allows to add headers, cookies, configure security policies etc.
     *
     * Useful for sending authenitication tokens with each request.
     *
     * @param prepareRequest A function which receives current Request and parameters and returns new request which will be used for HTTP request.
     * @returns An object allows to continue request configuration.
     */
    pre(prepareRequest: PrepareRequestFunction<TParams>): this;

    /**
     * Allows to replace default fetch method with custom one.
     *
     * Useful for implementing complex request logic: retrying after timeout, refreshing authentication tokens etc.
     *
     * @param customFetch: A function accepts Request object, params and returns Promise with response.
     * @returns An object allows to configure request.
     */
    withFetch(customFetch: (request: Request, params: TParams) => Promise<Response>): this;

    /**
     * Completely replaces response processing logic.
     * Allows to decide what to do with Response returned by fetch and when returns successfull results and when error.
     *
     * @param processor A function accepts Response and params and returns one of OkResult, ErrorResponseResult, AuthorizationErrorResult or TransportErrorResult.
     * @returns An object allows to create request object.
     */
    processResponse<TResult, TError>(processor: (response: Response, params: TParams) => Promise<HttpResult<TResult, TError>>): HttpRequestBuilder<TParams, TResult, TError>;

    /**
     * Processes a response body as JSON if case of successfull response or error response with body (only 400 Bad Request processed with body by default).
     * By default response processed in following way:
     *
     * * If response is ok, trying to get body as string.
     * ** parse value as JSON and returns ok result.
     * ** if error occured due parsing or reading body, failed with transport error with reason "ivalid-body".
     *
     * * If response is not ok but status code is 400
     * ** do the same steps as for ok response, but finish with error-response result instead of ok.
     *
     * * If response status is 401 or 403, fails with authorization error
     * * Otherwise fails with transport error
     *
     */
    resultFromJson<TResult, TError=any>(): HttpRequestBuilder<TParams, TResult, TError>;

    /**
     * Processes a response body using custom conversion function.
     * Function should interpret string as result or as error depending of second function parameter.
     *
     * * If response is ok, trying to get body as string.
     * ** parse value as JSON and returns ok result.
     * ** if error occured due parsing or reading body, failed with transport error with reason "ivalid-body".
     *
     * * If response is not ok but status code is 400
     * ** do the same steps as for ok response, but finish with error-response result instead of ok.
     *
     * * If response status is 401 or 403, fails with authorization error
     * * Otherwise fails with transport error
     *
     */
    convertResult<TResult, TError=any>(converter: (response: Response, isError: boolean, params: TParams) => Promise<TResult | TError>): HttpRequestBuilder<TParams, TResult, TError>;
}

/**
 * Configures HTTP request with body.
 */
export interface HttpRequestConfiguratorWithBody<TBody, TParams> {

    /**
     * Adds a function which modifies Request object before running it.
     * Allows to add headers, cookies, configure security policies etc.
     *
     * Useful for sending authenitication tokens with each request.
     * Useful for sending non-standard body (buffer, files, chunked etc.)
     * Call this method and set body to request.
     *
     * @param prepareRequest A function which receives current Request and parameters and returns new request which will be used for HTTP request.
     * @returns An object allows to continue request configuration.
     */
    pre(prepareRequest: PrepareRequestWithBodyFunction<TBody, TParams>): this;

    /**
     * Allows to replace default fetch method with custom one.
     *
     * Useful for implementing complex request logic: retrying after timeout, refreshing authentication tokens etc.
     *
     * @param customFetch: A function accepts Request object, params and returns Promise with response.
     * @returns An object allows to configure request.
     */
    withFetch(customFetch: (request: Request, params: TParams, body: TBody) => Promise<Response>): this;

    /**
     * Completely replaces response processing logic.
     * Allows to decide what to do with Response returned by fetch and when returns successfull results and when error.
     *
     * @param processor A function accepts Response and params and returns one of OkResult, ErrorResponseResult, AuthorizationErrorResult or TransportErrorResult.
     * @returns An object allows to create request object.
     */
    processResponse<TResult, TError>(processor: (response: Response, params: TParams, body: TBody) => Promise<HttpResult<TResult, TError>>): HttpRequestWithBodyBuilder<TBody, TParams, TResult, TError>;


    /**
     * Processes a response body as JSON if case of successfull response or error response with body (only 400 Bad Request processed with body by default).
     * By default response processed in following way:
     *
     * * If response is ok, trying to get body as string.
     * ** parse value as JSON and returns ok result.
     * ** if error occured due parsing or reading body, failed with transport error with reason "ivalid-body".
     *
     * * If response is not ok but status code is 400
     * ** do the same steps as for ok response, but finish with error-response result instead of ok.
     *
     * * If response status is 401 or 403, fails with authorization error
     * * Otherwise fails with transport error
     */
    resultFromJson<TResult, TError=any>(): HttpRequestWithBodyBuilder<TBody, TParams, TResult, TError>;

    /**
     * Processes a response body using custom conversion function.
     * Function should interpret string as result or as error depending of second function parameter.
     *
     * * If response is ok, trying to get body as string.
     * ** parse value as JSON and returns ok result.
     * ** if error occured due parsing or reading body, failed with transport error with reason "ivalid-body".
     *
     * * If response is not ok but status code is 400
     * ** do the same steps as for ok response, but finish with error-response result instead of ok.
     *
     * * If response status is 401 or 403, fails with authorization error
     * * Otherwise fails with transport error
     *
     */
    convertResult<TResult, TError=any>(converter: (response: Response, isError: boolean, params: TParams) => Promise<TResult | TError>): HttpRequestWithBodyBuilder<TBody, TParams, TResult, TError>;
}

/**
 * Creates an instances of HTTP request.
 */
export interface HttpRequestBuilder<TParams, TResult, TError> {

    /**
     * Finishes HTTP request configuration and creates an object which can be used for running HTTP requests.
     */
    build(): HttpRequest<TParams, TResult, TError>;
}

/**
 * Creates an instances of HTTP request.
 */
export interface HttpRequestWithBodyBuilder<TBody, TParams, TResult, TError> {
    /**
     * Finishes HTTP request configuration and creates an object which can be used for running HTTP requests.
     */
    build(): HttpRequestWithBody<TBody, TParams, TResult, TError>;
}