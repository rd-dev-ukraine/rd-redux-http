import {
    ReduxHttpCustomRequestFactory,
    ReduxHttpFetchResultConfig,
    ReduxHttpFetchRequestWithBodyFactory
} from "./api";


export interface FetchRequestConfigurationEntry {
    fetch<TParams>(method: string, url: string): FetchRequestConfiguration<TParams>;
    get<TParams>(url: string): FetchRequestConfiguration<TParams>;
    post<TParams>(url: string): FetchRequestConfiguration<TParams>;
    put<TParams>(url: string): FetchRequestConfiguration<TParams>;
    delete<TParams>(url: string): FetchRequestConfiguration<TParams>;
}

export type FetchRequestConfiguration<TParams> = QueryStringConfigurator<TParams> & BodyConfigurator<TParams> & PreConfigurator<TParams> & ResultConfigurator<TParams>;

export interface QueryStringConfigurator<TParams> {
    restParamsToQueryString(): BodyConfigurator<TParams> & PreConfigurator<TParams> & ResultConfigurator<TParams>;
}

export interface BodyConfigurator<TParams> {
    jsonBody<TBody>(): PreConfiguratorWithBody<TParams, TBody> & FetchCoreWithBodyConfigurator<TParams, TBody> & ResultConfiguratorWithBody<TParams, TBody>;
    formsBody<TBody>(): PreConfiguratorWithBody<TParams, TBody> & FetchCoreWithBodyConfigurator<TParams, TBody> & ResultConfiguratorWithBody<TParams, TBody>;
}

export interface PreConfigurator<TParams> {
    pre(middleware: (request: RequestInit, params: TParams) => RequestInit): ResultConfigurator<TParams> & PreConfigurator<TParams> & FetchCoreConfigurator<TParams>;
}

export interface PreConfiguratorWithBody<TParams, TBody> {
    pre(middleware: (request: RequestInit, params: TParams, body: TBody) => RequestInit):
        ResultConfiguratorWithBody<TParams, TBody> & PreConfiguratorWithBody<TParams, TBody> & FetchCoreWithBodyConfigurator<TParams, TBody>;
}

export interface FetchCoreConfigurator<TParams> {
    useFetch(fetch: (request: Request) => Promise<Response>): ResultConfigurator<TParams>;
}

export interface FetchCoreWithBodyConfigurator<TParams, TBody> {
    useFetch(fetch: (request: Request) => Promise<Response>): ResultConfiguratorWithBody<TParams, TBody>;
}

export interface ResultConfigurator<TParams> {
    resultAsJson<TResult, TError>(): FetchRequestBuilder<TParams, TResult, TError>;
}

export interface ResultConfiguratorWithBody<TParams, TBody> {
    resultAsJson<TResult, TError>(): FetchRequestWithBodyBuilder<TParams, TBody, TResult, TError>;
}

export interface FetchRequestWithBodyBuilder<TParams, TBody, TResult, TError> {
    build(): ReduxHttpFetchRequestWithBodyFactory<TParams, TBody> & ReduxHttpFetchResultConfig<TParams, TResult, TError>;
}

export interface FetchRequestBuilder<TParams, TResult, TError> {
    build(): ReduxHttpCustomRequestFactory<TParams> & ReduxHttpFetchResultConfig<TParams, TResult, TError>;
}


