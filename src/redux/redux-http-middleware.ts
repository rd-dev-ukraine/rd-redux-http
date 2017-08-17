import { Middleware, MiddlewareAPI, Dispatch, Action } from "redux";

import { HttpRequest, HttpRequestWithBody } from "../http";

import { parseActionType, OperationType, formatActionType } from "./action-type-helper";
import { ReduxHttpRequest, ReduxHttpRequestWithBody, ErrorAction, RunHttpRequestWithBodyAction } from "./api";
import { RequestRegistry } from "./request-registry";


export interface ReduxHttpMiddleware extends Middleware {
    register<TParams, TResult, TError>(request: HttpRequest<TParams, TResult, TError>): ReduxHttpRequest<TParams, TResult, TError>;
    register<TBody, TParams, TResult, TError>(request: HttpRequestWithBody<TBody, TParams, TResult, TError>): ReduxHttpRequestWithBody<TBody, TParams, TResult, TError>;
}

export function reduxHttpMiddleware(): ReduxHttpMiddleware {
    const registry = new RequestRegistry();

    const mw: ReduxHttpMiddleware = (
        (store: MiddlewareAPI<any>) => (dispatch: Dispatch<any>) => (action: Action): any => {
            const parsedAction = parseActionType(action.type);

            if (parsedAction.isMatch && parsedAction.operation === "run") {
                const request = registry.take(parsedAction.requestId) as HttpRequestWithBody<any, any, any, any>;
                const typedAction = action as RunHttpRequestWithBodyAction<any, any>;

                if (request) {
                    request(typedAction.params, typedAction.body)
                        .then(result => {
                            const resultAction = {
                                ...result,
                                type: formatActionType(
                                    parsedAction.requestId,
                                    result.ok ? "result" : "error",
                                    request.method,
                                    request.urlTemplate
                                ),
                                params: typedAction.params
                            };

                            store.dispatch(resultAction);
                        });
                }
            }

            return dispatch(action);
        }

    ) as any;

    mw.register = (request: any) => {
        if (!request) {
            throw new Error("HttpRequest object is not defined.");
        }

        const requestId = registry.register(request);
        const requestTyped = request as HttpRequest<any, any, any>;

        function testRequestAction(action?: Action, operation?: OperationType): boolean {
            if (!action) {
                return false;
            }

            const result = parseActionType(action.type);
            return result.isMatch &&
                result.requestId === requestId &&
                (!!operation && result.operation === operation);
        };

        function isError(action?: Action): action is ErrorAction<any, any> {
            return testRequestAction(action, "error");
        }

        function makeActionType(operation: OperationType): string {
            return formatActionType(requestId, operation, requestTyped.method, requestTyped.urlTemplate);
        }

        request.isMy = (action?: Action) => testRequestAction(action);

        request.isRunning = (action?: Action) => testRequestAction(action, "run");
        request.isOk = (action?: Action) => testRequestAction(action, "result");
        request.isError = isError;

        request.isErrorResponse = (action?: Action): boolean => isError(action) && action.errorType === "response";
        request.isAuthorizationError = (action?: Action): boolean => isError(action) && action.errorType === "authorization";
        request.isTransportError = (action?: Action): boolean => isError(action) && action.errorType === "transport";

        request.run = (params: any, body?: any): any => ({
            type: makeActionType("run"),
            params,
            body
        });

        return request as any;
    };

    return mw as any;
}