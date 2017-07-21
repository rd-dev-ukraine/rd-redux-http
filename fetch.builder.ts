import * as querystring from "querystring";

import {
    ReduxHttpCustomRequestFactory,
    ReduxHttpFetchResultConfig,
    ReduxHttpFetchRequestWithBodyFactory
} from "./api";

import { ReduxHttpFetchTypeGuard } from "./action-helpers";

import * as api from "./fetch.builder.api";

import {
    FetchRequestConfiguration,
    ReduxHttpFetchRequestWithParams,
    ReduxHttpFetchRequestWithBody
} from "./fetch.core";


class FetchRequestConfigurationEntryImpl extends ReduxHttpFetchTypeGuard implements api.FetchRequestConfigurationEntry {

    fetch<TParams>(method: string, url: string): api.FetchRequestConfiguration<TParams> {
        if (!method) {
            throw new Error("Method is not defined.");
        }
        if (!url) {
            throw new Error("URL is not defined.");
        }

        return new FetchBuilderWithParams<TParams>(
            new FetchBuilderCore({
                method,
                url
            }));
    }

    get<TParams>(url: string): api.FetchRequestConfiguration<TParams> {
        return this.fetch<TParams>("get", url);
    }

    post<TParams>(url: string): api.FetchRequestConfiguration<TParams> {
        return this.fetch<TParams>("post", url);
    }

    put<TParams>(url: string): api.FetchRequestConfiguration<TParams> {
        return this.fetch<TParams>("put", url);
    }

    delete<TParams>(url: string): api.FetchRequestConfiguration<TParams> {
        return this.fetch<TParams>("delete", url);
    }
}

class FetchBuilderCore {
    private paramRegex: RegExp = /:[A-Za-z]\w{1,}/g;


    constructor(private configuration: Partial<FetchRequestConfiguration>) {
        if (!configuration) {
            throw new Error("Configuration is not provided.");
        }

        this.configuration.pre = [this.urlFromParamsPre.bind(this)];
    }

    pre(middleware: (request: Request, params: any, body?: any) => RequestInit): void {
        if (!middleware) {
            throw new Error("Middleware is not defined.");
        }

        if (!this.configuration.pre) {
            this.configuration.pre = [];
        }

        this.configuration.pre.push(middleware);
    }

    restOfParamsToQueryString(): void {
        this.pre(this.appendQueryStringFromRestParamsPre.bind(this));
    }

    jsonBody(): void {
        this.pre((request: RequestInit, params: any, body: any) => {
            request.headers = request.headers || {};

            request.headers["Content-Type"] = "application/json";
            if (body) {
                request.body = JSON.stringify(body);
            }

            return request;
        });
    }

    formsBody(): void {
        this.pre((request: RequestInit, params: any, body: any) => {

            request.headers = request.headers || {};
            request.headers["Content-Type"] = "application/x-form-urlencoded";

            if (body) {
                request.body = querystring.stringify(body);
            }

            return request;
        });
    }

    withFetch(fetch: (request: Request) => Promise<Response>): void {
        if (!fetch) {
            throw new Error("Custom fetch is not defined.");
        }

        this.configuration.fetch = fetch;
    }

    getConfiguration(): FetchRequestConfiguration {
        return this.configuration as FetchRequestConfiguration;
    }

    private urlFromParamsPre(request: Request, params: any, body?: any): RequestInit {
        if (!this.configuration || !this.configuration.url) {
            return { ...request } as RequestInit;
        }

        const p: any = { ...(params || {}) };

        const url = this.configuration.url.replace(this.paramRegex, (match: string) => {
            match = match.replace(/[:()]/g, "");

            const value = p[match] || "";
            delete p[match];

            return `${value}`;
        });

        return {
            ...request,
            url
        } as RequestInit;
    }

    private appendQueryStringFromRestParamsPre(request: Request, params: any): RequestInit {

        if (this.configuration && this.configuration.url) {

            const p = { ...(params || {}) };

            this.configuration.url.replace(this.paramRegex, (match: string) => {
                match = match.replace(/[:()]/g, "");

                const value = p[match] || "";
                delete p[match];

                return `${value}`;
            });

            const queryString = querystring.stringify(p);
            if (queryString.trim()) {
                return {
                    ...request,
                    url: `${request.url}?${queryString}`
                } as RequestInit;
            }
        }

        return { ...request } as RequestInit;
    }
}

class FetchBuilderWithParams<TParams> implements
    api.QueryStringConfigurator<TParams>,
    api.BodyConfigurator<TParams>,
    api.PreConfigurator<TParams>,
    api.ResultConfigurator<TParams>,
    api.FetchCoreConfigurator<TParams> {

    constructor(private core: FetchBuilderCore) {
        if (!core) {
            throw new Error("Core is not provided.");
        }
    }

    restParamsToQueryString(): api.BodyConfigurator<TParams> & api.PreConfigurator<TParams> & api.ResultConfigurator<TParams> {
        this.core.restOfParamsToQueryString();
        return this;
    }

    jsonBody<TBody>(): api.PreConfiguratorWithBody<TParams, TBody> & api.FetchCoreWithBodyConfigurator<TParams, TBody> & api.ResultConfiguratorWithBody<TParams, TBody> {
        this.core.jsonBody();
        return new FetchBuilderWithBody<TParams, TBody>(this.core);
    }

    formsBody<TBody>(): api.PreConfiguratorWithBody<TParams, TBody> & api.FetchCoreWithBodyConfigurator<TParams, TBody> & api.ResultConfiguratorWithBody<TParams, TBody> {
        this.core.formsBody();
        return new FetchBuilderWithBody<TParams, TBody>(this.core);
    }

    pre(middleware: (request: RequestInit, params: TParams) => RequestInit): api.ResultConfigurator<TParams> & api.PreConfigurator<TParams> & api.FetchCoreConfigurator<TParams> {
        if (!middleware) {
            throw new Error("Middleware is not defined.");
        }

        this.core.pre(middleware);

        return this;
    }

    useFetch(fetch: (request: Request) => Promise<Response>): api.ResultConfigurator<TParams> {
        this.core.withFetch(fetch);

        return this;
    }

    resultAsJson<TResult, TError>(): api.FetchRequestBuilder<TParams, TResult, TError> {
        return this.createBuilder<TResult, TError>();
    }

    private createBuilder<TResult, TError>(): api.FetchRequestBuilder<TParams, TResult, TError> {
        const configuration = this.core.getConfiguration();

        return new class {
            build(): ReduxHttpCustomRequestFactory<TParams> & ReduxHttpFetchResultConfig<TParams, TResult, TError> {
                return new ReduxHttpFetchRequestWithParams<TParams, TResult, TError>(configuration);
            }
        };
    }
}

class FetchBuilderWithBody<TParams, TBody> implements
    api.PreConfiguratorWithBody<TParams, TBody>,
    api.ResultConfiguratorWithBody<TParams, TBody>,
    api.FetchCoreWithBodyConfigurator<TParams, TBody> {
    constructor(private core: FetchBuilderCore) {
        if (!core) {
            throw new Error("Core is not provided.");
        }
    }

    pre(middleware: (request: RequestInit, params: TParams, body: TBody) => RequestInit):
        api.ResultConfiguratorWithBody<TParams, TBody> & api.PreConfiguratorWithBody<TParams, TBody> & api.FetchCoreWithBodyConfigurator<TParams, TBody> {
        if (!middleware) {
            throw new Error("Middleware is not defined.");
        }

        this.core.pre(middleware);
        return this;
    }

    useFetch(fetch: (request: Request) => Promise<Response>): api.ResultConfiguratorWithBody<TParams, TBody> {
        if (!fetch) {
            throw new Error("");
        }

        this.core.withFetch(fetch);

        return this;
    }

    resultAsJson<TResult, TError>(): api.FetchRequestWithBodyBuilder<TParams, TBody, TResult, TError> {
        return this.createBuilder<TResult, TError>();
    }

    private createBuilder<TResult, TError>(): api.FetchRequestWithBodyBuilder<TParams, TBody, TResult, TError> {
        const configuration = this.core.getConfiguration();

        return new class {
            build(): ReduxHttpFetchRequestWithBodyFactory<TParams, TBody> & ReduxHttpFetchResultConfig<TParams, TResult, TError> {
                return new ReduxHttpFetchRequestWithBody<TParams, TBody, TResult, TError>(configuration);
            }
        };
    }
}

export const http: api.FetchRequestConfigurationEntry & ReduxHttpFetchResultConfig<any, any, any> = new FetchRequestConfigurationEntryImpl();