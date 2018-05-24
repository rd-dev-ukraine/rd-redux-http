import { Action } from "redux";

import { HttpRequest } from "../http";
import { ReduxHttpRequestState, ReduxHttpInitialState } from "./http-request-redux";

export function createReducer<TParams, TResult, TError>(httpRequest: HttpRequest<TParams, TResult, TError>):
    (state: ReduxHttpRequestState<TParams, TResult, TError>, action: Action) => ReduxHttpRequestState<TParams, TResult, TError> {

    return (state, action) => {
        if (!state) {
            state = {
                fetchState: "initial"
            } as ReduxHttpInitialState;
        }

        if (httpRequest.actions.isRunning(action)) {
            return {
                ...state,
                error: undefined,
                params: action.params,
                fetchState: "loading"
            } as any;
        }

        if (httpRequest.actions.isOk(action)) {
            return {
                ...state,
                error: undefined,
                data: action.result,
                params: action.params,
                fetchState: "successful"
            };
        }

        if (httpRequest.actions.isError(action)) {
            return {
                ...state,
                error: action,
                params: action.params,
                fetchState: "error"
            };
        }


        return state;
    };
}
