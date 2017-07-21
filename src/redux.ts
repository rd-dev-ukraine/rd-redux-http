import { Action, Dispatch, Middleware, MiddlewareAPI } from "redux";

import { parseReduxHttpActionType } from "./action-helpers";
import { retrieveWorker } from "./async-workers-registry";


export function reduxHttpMiddleware(): Middleware {
    return (store: MiddlewareAPI<any>) => (dispatch: Dispatch<any>) => (action: Action) => {
        const parseResult = parseReduxHttpActionType(action.type);

        if (parseResult.isReduxHttpAction && !parseResult.isResult) {
            const worker = retrieveWorker(parseResult.asyncWorkerId);

            worker(action).then(action => store.dispatch(action));
        }

        return dispatch(action);
    };
}