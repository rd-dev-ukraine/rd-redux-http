import { MiddlewareAPI, Dispatch, Action } from "redux";

import { HttpRequestWithBody, TriggerRequestWithBodyAction } from "../http";
import { parseActionType } from "../http/runtime/action-type-helper";

import { ReduxHttpMiddleware } from "./api";
import { RequestRegistry } from "./request-registry";


/**
 * Factory for creating middlewares for rd-redux-http integration with redux.
 * One middleware per store is enough usually :)
 */
export function reduxHttpMiddlewareFactory(): ReduxHttpMiddleware {
    const registry = new RequestRegistry();

    const mw: ReduxHttpMiddleware = (
        (store: MiddlewareAPI<any>) => (dispatch: Dispatch<any>) => (action: Action): any => {

            const parsedAction = parseActionType(action.type);
            if (parsedAction.isMatch && parsedAction.operation === "request") {
                const { request, transform } = registry.take(parsedAction.requestId) as {
                    request: HttpRequestWithBody<any, any, any, any>;
                    transform: (result: any) => any;
                };

                const typedAction = action as TriggerRequestWithBodyAction<any, any>;

                if (request) {
                    store.dispatch(request.actions.running(typedAction.params));

                    request(typedAction.params, typedAction.body)
                        .then(result => {

                            const resultAction = result.ok
                                ? request.actions.ok(typedAction.params, transform(result))
                                : request.actions.error(typedAction.params, result);

                            store.dispatch(resultAction);
                        });
                }
            }

            return dispatch(action);
        }

    ) as any;

    mw.register = (request: any, transform?: (result: any) => any) => {
        if (!request) {
            throw new Error("HttpRequest object is not defined.");
        }

        registry.register(request, transform || (r => r));
        const requestTyped = request as HttpRequestWithBody<any, any, any, any>;

        request.trigger = (params: any, body?: any): any => requestTyped.actions.trigger(params, body);
        request.isTriggering = (action?: Action): any => requestTyped.actions.isTriggering(action);

        return request as any;
    };

    return mw as any;
}