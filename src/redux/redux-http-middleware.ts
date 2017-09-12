import { MiddlewareAPI, Dispatch, Action } from "redux";

import { HttpRequestWithBody, RunRequestWithBodyAction } from "../http";
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
            if (parsedAction.isMatch && parsedAction.operation === "run") {
                const request = registry.take(parsedAction.requestId) as HttpRequestWithBody<any, any, any, any>;
                const typedAction = action as RunRequestWithBodyAction<any, any>;

                if (request) {
                    store.dispatch(request.actions.running(typedAction.params));

                    request(typedAction.params, typedAction.body)
                        .then(result => {

                            const resultAction = result.ok
                                ? request.actions.ok(typedAction.params, result)
                                : request.actions.error(typedAction.params, result);

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

        registry.register(request);
        const requestTyped = request as HttpRequestWithBody<any, any, any, any>;

        request.run = (params: any, body?: any): any => requestTyped.actions.run(params, body);
        request.isRun = (action?: Action): any => requestTyped.actions.isRun(action);

        return request as any;
    };

    return mw as any;
}