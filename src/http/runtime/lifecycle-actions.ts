import { Action } from "redux";

import {
    LifecycleActions,
    RequestOkAction,
    RequestErrorAction,
    RequestRunningAction,
    ReduxHttpLifecycleActionBase,
    LifecycleActionTypes
} from "../api";

import { formatActionType, parseActionType, MatchActionInfo, OperationType } from "./action-type-helper";

let counter = 0;


export function createLifecycleActions<TParams, TResult, TError>(method: string, url: string): LifecycleActions<TParams, TResult, TError> {
    return new LifecycleActionsImpl(`${counter++}`, method, url);
}


class LifecycleActionsImpl<TParams, TResult, TError> implements LifecycleActions<TParams, TResult, TError>{
    types: LifecycleActionTypes<TParams, TResult, TError> = {
        get params(): TParams { throw new Error("Use this with Typescript typeof operator only"); },
        get result(): TResult { throw new Error("Use this with Typescript typeof operator only"); },
        get error(): TError { throw new Error("Use this with Typescript typeof operator only"); },

        get runningAction(): RequestRunningAction<TParams> { throw new Error("Use this with Typescript typeof operator only"); },
        get okAction(): RequestOkAction<TParams, TResult> { throw new Error("Use this with Typescript typeof operator only"); },
        get errorAction(): RequestErrorAction<TParams, TError> { throw new Error("Use this with Typescript typeof operator only"); },
    };

    constructor(
        private requestId: string,
        private method: string,
        private url: string) {
    }

    isMy(action?: Action): action is ReduxHttpLifecycleActionBase<TParams> {
        const match = this.match(action);
        return match.isMatch && match.requestId === this.requestId;
    }

    isRunning(action?: Action): action is RequestRunningAction<TParams> {
        const match = this.match(action);
        return match.isMatch &&
            match.requestId === this.requestId &&
            match.operation === "running";
    }

    isOk(action?: Action): action is RequestOkAction<TParams, TResult> {
        const match = this.match(action);
        return match.isMatch &&
            match.requestId === this.requestId &&
            match.operation === "ok";
    }
    isError(action?: Action): action is RequestErrorAction<TParams, TError> {
        const match = this.match(action);
        return match.isMatch &&
            match.requestId === this.requestId &&
            match.operation === "error";
    }
    isCompleted(action?: Action): action is RequestOkAction<TParams, TResult> | RequestErrorAction<TParams, TError> {
        return this.isOk(action) || this.isError(action);
    }

    running(params: TParams): RequestRunningAction<TParams> {
        return {
            type: this.actionType("running"),
            params
        };
    }
    ok(params: TParams, result: TResult): RequestOkAction<TParams, TResult> {
        return {
            type: this.actionType("ok"),
            ok: true,
            params,
            result
        };
    }
    error(params: TParams, error: TError): RequestErrorAction<TParams, TError> {
        return {
            type: this.actionType("error"),
            ok: false,
            params,
            error
        };
    }

    private match(action?: Action): MatchActionInfo | { isMatch: false } {
        if (!action) {
            return { isMatch: false };
        }

        return parseActionType(action.type || "");
    }

    private actionType(operation: OperationType): string {
        return formatActionType(this.requestId, operation, this.method, this.url);
    }
}