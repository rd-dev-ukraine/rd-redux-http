import { Action } from "redux";

import {
    ActionFactory,
    RequestRunningAction,
    ReduxHttpLifecycleActionBase,
    ActionTypes,
    OkResultAction,
    ErrorResponseAction,
    ErrorResultAction,
    OkResult,
    ErrorResponseResult,
    AuthorizationErrorResult,
    TransportErrorResult,
    AuthorizationErrorResultAction,
    TransportErrorResultAction,
    RunRequestActionFactory,
    RunRequestWithBodyActionFactory,
    RunRequestAction,
    RunRequestWithBodyAction
} from "../api";

import { formatActionType, parseActionType, MatchActionInfo, OperationType } from "./action-type-helper";


export function createActions<TParams, TResult, TError, TBody=undefined>(id: string, method: string, url: string): ActionFactory<TParams, TResult, TError> & RunRequestActionFactory<TParams> & RunRequestWithBodyActionFactory<TParams, TBody> {
    return new ActionFactoryImpl(id, method, url);
}

class ActionFactoryImpl<TParams, TResult, TError, TBody = undefined> implements ActionFactory<TParams, TResult, TError>, RunRequestActionFactory<TParams>, RunRequestWithBodyActionFactory<TParams, TBody> {

    types: ActionTypes<TParams, TResult, TError> = {
        get params(): TParams { throw new Error("Use this with Typescript typeof operator only"); },
        get result(): TResult { throw new Error("Use this with Typescript typeof operator only"); },
        get error(): TError { throw new Error("Use this with Typescript typeof operator only"); },

        get runningAction(): RequestRunningAction<TParams> { throw new Error("Use this with Typescript typeof operator only"); },
        get okAction(): OkResultAction<TParams, TResult> { throw new Error("Use this with Typescript typeof operator only"); },
        get errorAction(): ErrorResultAction<TParams, TError> { throw new Error("Use this with Typescript typeof operator only"); },
    };

    constructor(
        public requestId: string,
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

    isOk(action?: Action): action is OkResultAction<TParams, TResult> {
        const match = this.match(action);
        return match.isMatch &&
            match.requestId === this.requestId &&
            match.operation === "ok";
    }


    isError(action?: Action): action is ErrorResultAction<TParams, TError> {
        const match = this.match(action);
        return match.isMatch &&
            match.requestId === this.requestId &&
            match.operation === "error";
    }

    isErrorResponse(action?: Action): action is ErrorResponseAction<TParams, TError> {
        return this.isError(action) && action.errorType === "response";
    }

    isAuthorizationError(action?: Action): action is AuthorizationErrorResultAction<TParams> {
        return this.isError(action) && action.errorType === "authorization";

    }

    isTransportError(action?: Action): action is TransportErrorResultAction<TParams> {
        return this.isError(action) && action.errorType === "transport";
    }


    isCompleted(action?: Action): action is OkResultAction<TParams, TResult> | ErrorResultAction<TParams, TError> {
        return this.isOk(action) || this.isError(action);
    }

    running(params: TParams): RequestRunningAction<TParams> {
        return {
            type: this.actionType("running"),
            params
        };
    }

    ok(params: TParams, result: OkResult<TResult>): OkResultAction<TParams, TResult> {
        return {
            ...result,
            type: this.actionType("ok"),
            params,
        };
    }

    error(params: TParams, error: ErrorResponseResult<TError> | AuthorizationErrorResult | TransportErrorResult): ErrorResultAction<TParams, TError> {
        return {
            type: this.actionType("error"),
            params,
            ...error
        };
    }

    run(params: TParams): RunRequestAction<TParams>;
    run(params: TParams, body: TBody): RunRequestWithBodyAction<TParams, TBody>;
    run(params: TParams, body?: any): any {
        if (body) {
            return {
                type: this.actionType("run"),
                params,
                body
            };
        } else {
            return {
                type: this.actionType("run"),
                params
            } as any;
        }
    }

    isRun(action?: Action): action is RunRequestWithBodyAction<TParams, TBody>;
    isRun(action?: Action): action is RunRequestAction<TParams> {
        const match = this.match(action);
        return match.isMatch && match.operation === "run";
    }

    protected match(action?: Action): MatchActionInfo | { isMatch: false } {
        if (!action) {
            return { isMatch: false };
        }

        return parseActionType(action.type || "");
    }

    protected actionType(operation: OperationType): string {
        return formatActionType(this.requestId, operation, this.method, this.url);
    }
}