import { Action } from "redux";

import { HttpRequest } from "../http";
import { ReduxHttpRequestState, ReduxHttpInitialState } from "./http-request-redux";
import { FETCH_STATE_INITIAL, FETCH_STATE_FETCHING, FETCH_STATE_SUCCESS, FETCH_STATE_ERROR } from ".";

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
                errorType: undefined,
                status: undefined,
                statusCode: undefined,
                reason: undefined,
                params: action.params,
                fetchState: FETCH_STATE_FETCHING
            } as any;
        }

        if (httpRequest.actions.isOk(action)) {
            return {
                ...state,
                error: undefined,
                errorType: undefined,
                status: undefined,
                statusCode: undefined,
                reason: undefined,
                data: action.result,
                params: action.params,
                fetchState: FETCH_STATE_SUCCESS
            };
        }

        if (httpRequest.actions.isError(action)) {
            return {
                ...state,
                ...action,
                params: action.params,
                fetchState: FETCH_STATE_ERROR
            };
        }

        return state;
    };
}
