import { MiddlewareAPI, Dispatch, Action } from "redux";

import { HttpRequestWithBody, TriggerRequestWithBodyAction } from "../http";
import { parseActionType } from "../http/runtime/action-type-helper";

import { ReduxHttpMiddleware } from "./api";
import { RequestRegistry } from "./request-registry";
import { createReducer } from "./create-reducer";

/**
 * Factory for creating middlewares for rd-redux-http integration with redux.
 * One middleware per store is enough usually :)
 */
export function reduxHttpMiddlewareFactory(): ReduxHttpMiddleware {
    const registry = new RequestRegistry();

    const mw: ReduxHttpMiddleware = ((store: MiddlewareAPI<any>) => (dispatch: Dispatch<any>) => (
        action: Action
    ): any => {
        const parsedAction = parseActionType(action.type);
        if (parsedAction.isMatch && parsedAction.operation === "request") {
            const { request, transform } = registry.take(parsedAction.requestId) as {
                request: HttpRequestWithBody<any, any, any, any>;
                transform: (result: any, params: any, body: any) => any;
            };

            const typedAction = action as TriggerRequestWithBodyAction<any, any>;

            if (request) {
                store.dispatch(request.actions.running(typedAction.params));

                request(typedAction.params, typedAction.body).then(response => {
                    const resultAction = response.ok
                        ? request.actions.ok(typedAction.params, {
                              ...response,
                              result: transform(response.result, typedAction.params, typedAction.body)
                          })
                        : request.actions.error(typedAction.params, response);

                    store.dispatch(resultAction);
                });
            }
        }

        return dispatch(action);
    }) as any;

    mw.register = (request: any, transform?: (result: any) => any) => {
        if (!request) {
            throw new Error("HttpRequest object is not defined.");
        }

        registry.register(request, transform || (r => r));
        const requestTyped = request as HttpRequestWithBody<any, any, any, any>;

        request.trigger = (params: any, body?: any): any => requestTyped.actions.trigger(params, body);
        request.isTriggering = (action?: Action): any => requestTyped.actions.isTriggering(action);
        request.reducer = createReducer(request as any);

        return request as any;
    };

    return mw as any;
}
