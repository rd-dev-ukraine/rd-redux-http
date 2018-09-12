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
    MakeRequestActionFactory,
    MakeRequestWithBodyActionFactory,
    TriggerRequestAction,
    TriggerRequestWithBodyAction
} from "../api";

import { formatActionType, parseActionType, MatchActionInfo, OperationType } from "./action-type-helper";

export function createActions<TParams, TResult, TError, TBody = undefined>(
    id: string,
    method: string,
    url: string | ((params: TParams) => string) | ((params: TParams) => Promise<string>),
    name: string
): ActionFactory<TParams, TResult, TError> &
    MakeRequestActionFactory<TParams> &
    MakeRequestWithBodyActionFactory<TParams, TBody> {
    return new ActionFactoryImpl(id, method, url, name);
}

class ActionFactoryImpl<TParams, TResult, TError, TBody = undefined>
    implements
        ActionFactory<TParams, TResult, TError>,
        MakeRequestActionFactory<TParams>,
        MakeRequestWithBodyActionFactory<TParams, TBody> {
    types: ActionTypes<TParams, TResult, TError> = {
        get params(): TParams {
            throw new Error("Use this with Typescript typeof operator only");
        },
        get result(): TResult {
            throw new Error("Use this with Typescript typeof operator only");
        },
        get error(): TError {
            throw new Error("Use this with Typescript typeof operator only");
        },

        get runningAction(): RequestRunningAction<TParams> {
            throw new Error("Use this with Typescript typeof operator only");
        },
        get okAction(): OkResultAction<TParams, TResult> {
            throw new Error("Use this with Typescript typeof operator only");
        },
        get errorAction(): ErrorResultAction<TParams, TError> {
            throw new Error("Use this with Typescript typeof operator only");
        }
    };

    constructor(
        public requestId: string,
        private method: string,
        private url: string | ((params: TParams) => string) | ((params: TParams) => Promise<string>),
        private name: string
    ) {}

    isMy(action?: Action): action is ReduxHttpLifecycleActionBase<TParams> {
        const match = this.match(action);
        return match.isMatch && match.requestId === this.requestId;
    }

    isRunning(action?: Action): action is RequestRunningAction<TParams> {
        const match = this.match(action);
        return match.isMatch && match.requestId === this.requestId && match.operation === "running";
    }

    isOk(action?: Action): action is OkResultAction<TParams, TResult> {
        const match = this.match(action);
        return match.isMatch && match.requestId === this.requestId && match.operation === "ok";
    }

    isError(action?: Action): action is ErrorResultAction<TParams, TError> {
        const match = this.match(action);
        return match.isMatch && match.requestId === this.requestId && match.operation === "error";
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
            params
        };
    }

    error(
        params: TParams,
        error: ErrorResponseResult<TError> | AuthorizationErrorResult | TransportErrorResult
    ): ErrorResultAction<TParams, TError> {
        return {
            type: this.actionType("error"),
            params,
            ...error
        };
    }

    trigger(params: TParams): TriggerRequestAction<TParams>;
    trigger(params: TParams, body: TBody): TriggerRequestWithBodyAction<TParams, TBody>;
    trigger(params: TParams, body?: any): any {
        if (body) {
            return {
                type: this.actionType("request"),
                params,
                body
            };
        } else {
            return {
                type: this.actionType("request"),
                params
            } as any;
        }
    }

    isTriggering(action?: Action): action is TriggerRequestWithBodyAction<TParams, TBody>;
    isTriggering(action?: Action): action is TriggerRequestAction<TParams> {
        const match = this.match(action);
        return match.isMatch && match.operation === "request";
    }

    protected match(action?: Action): MatchActionInfo | { isMatch: false } {
        if (!action) {
            return { isMatch: false };
        }

        return parseActionType(action.type || "");
    }

    protected actionType(operation: OperationType): string {
        return formatActionType(this.requestId, this.name, operation, this.method, this.url);
    }
}
