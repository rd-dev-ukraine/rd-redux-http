import { Action } from "redux";

import { HttpRequest, anyRequest } from "../http";
import { ReduxHttpRequestState, ReduxHttpInitialState } from "./http-request-redux";
import { FETCH_STATE_INITIAL, FETCH_STATE_FETCHING, FETCH_STATE_SUCCESS, FETCH_STATE_ERROR, FETCH_STATE } from ".";

export function createReducer<TParams, TResult, TError>(
    httpRequest: HttpRequest<TParams, TResult, TError>
): (
    state: ReduxHttpRequestState<TParams, TResult, TError>,
    action: Action
) => ReduxHttpRequestState<TParams, TResult, TError> {
    return (state, action) => {
        if (!state) {
            state = {
                fetchState: FETCH_STATE_INITIAL
            } as ReduxHttpInitialState;
        }

        if (httpRequest.actions.isRunning(action)) {
            return {
                ...state,
                error: undefined,
                params: action.params,
                fetchState: FETCH_STATE_FETCHING
            } as any;
        }

        if (httpRequest.actions.isOk(action)) {
            return {
                ...state,
                error: undefined,
                data: action.result,
                params: action.params,
                fetchState: FETCH_STATE_SUCCESS
            };
        }

        if (httpRequest.actions.isError(action)) {
            return {
                ...state,
                error: action,
                params: action.params,
                fetchState: FETCH_STATE_ERROR
            };
        }

        return state;
    };
}

export function getFetchStateFromAction(action: Action, defaultState: FETCH_STATE = FETCH_STATE_INITIAL): FETCH_STATE {
    if (anyRequest.isRunning(action)) {
        return FETCH_STATE_FETCHING;
    }

    if (anyRequest.isOk(action)) {
        return FETCH_STATE_SUCCESS;
    }

    if (anyRequest.isError(action)) {
        return FETCH_STATE_ERROR;
    }

    return defaultState || FETCH_STATE_INITIAL;
}
