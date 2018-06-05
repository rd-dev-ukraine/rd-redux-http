import { Action } from "redux";
import { HttpRequest } from "../http";
import { ReduxHttpRequestState } from "./http-request-redux";
import { FETCH_STATE } from ".";
export declare function createReducer<TParams, TResult, TError>(httpRequest: HttpRequest<TParams, TResult, TError>): (state: ReduxHttpRequestState<TParams, TResult, TError>, action: Action) => ReduxHttpRequestState<TParams, TResult, TError>;
export declare function getFetchStateFromAction(action: Action, defaultState?: FETCH_STATE): FETCH_STATE;
