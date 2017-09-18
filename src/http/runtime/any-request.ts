import { Action } from "redux";

import {
    ActionTypeGuards,
    MakeRequestActionTypeGuards,
    MakeRequestWithBodyActionTypeGuards,
    ReduxHttpLifecycleActionBase,
    RequestRunningAction,
    OkResultAction,
    ErrorResultAction,
    ErrorResponseAction,
    AuthorizationErrorResultAction,
    TransportErrorResultAction,
    MakeRequestWithBodyAction,
    MakeRequestAction
} from "../api";

import { parseActionType } from "./action-type-helper";


class AnyActionTypeGuardsImpl<TParams, TResult, TError, TBody=undefined> implements ActionTypeGuards<TParams, TResult, TError>,
    MakeRequestActionTypeGuards<TParams>,
    MakeRequestWithBodyActionTypeGuards<TParams, TBody> {

    isMy(action?: Action | undefined): action is ReduxHttpLifecycleActionBase<TParams> {
        if (!action) {
            return false;
        }

        const match = parseActionType(action.type);
        return match.isMatch;

    }
    isRunning(action?: Action | undefined): action is RequestRunningAction<TParams> {
        if (!action) {
            return false;
        }

        const match = parseActionType(action.type);
        return match.isMatch && match.operation === "running";
    }

    isOk(action?: Action | undefined): action is OkResultAction<TParams, TResult> {
        if (!action) {
            return false;
        }

        const match = parseActionType(action.type);
        return match.isMatch && match.operation === "ok";
    }

    isError(action?: Action | undefined): action is ErrorResultAction<TParams, TError> {
        if (!action) {
            return false;
        }

        const match = parseActionType(action.type);
        return match.isMatch && match.operation === "error";
    }

    isErrorResponse(action?: Action | undefined): action is ErrorResponseAction<TParams, TError> {
        return this.isError(action) && action.errorType === "response";
    }

    isAuthorizationError(action?: Action | undefined): action is AuthorizationErrorResultAction<TParams> {
        return this.isError(action) && action.errorType === "authorization";
    }

    isTransportError(action?: Action | undefined): action is TransportErrorResultAction<TParams> {
        return this.isError(action) && action.errorType === "transport";
    }

    isCompleted(action?: Action | undefined): action is OkResultAction<TParams, TResult> | ErrorResponseAction<TParams, TError> | AuthorizationErrorResultAction<TParams> | TransportErrorResultAction<TParams> {
        return this.isOk(action) || this.isError(action);
    }

    isRequesting(action?: Action): action is MakeRequestWithBodyAction<TParams, TBody>;
    isRequesting(action?: Action): action is MakeRequestAction<TParams> {
        if (!action) {
            return false;

        }

        const match = parseActionType(action.type);

        return match.isMatch && match.operation === "request";
    }
}

/** Type guards for matching any rd-redux-http action. */
export const anyRequest: ActionTypeGuards<any, any, any> & MakeRequestActionTypeGuards<any> & MakeRequestWithBodyActionTypeGuards<any, any> =
    new AnyActionTypeGuardsImpl<any, any, any, any>();