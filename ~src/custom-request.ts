import { Action } from "redux";

import { buildReduxHttpActionType, parseReduxHttpActionType, ReduxHttpCommonTypeGuard } from "./action-helpers";

import {
    ReduxHttpCustomRequestAction,
    ReduxHttpCustomRequestFactory,
    ReduxHttpCustomRequestResultConfig,
    ReduxHttpOkResult,
    ReduxHttpErrorResult,
    ReduxHttpActionBase
} from "./api";

import { registerAsyncWorkerAuto } from "./async-workers-registry";

export class CustomRequestBuilder extends ReduxHttpCommonTypeGuard {
    define<TParams, TResult, TError>(
        asyncWorker: (params: TParams) => Promise<TResult>): ReduxHttpCustomRequestFactory<TParams> & ReduxHttpCustomRequestResultConfig<TParams, TResult, TError> {
        if (!asyncWorker) {
            throw new Error("Async worker is not provided.");
        }

        let asyncWorkerId = "";

        const worker = (action: Action) => {
            const { params } = action as any;

            return asyncWorker(params)
                .then((result: TResult) => {
                    const action: ReduxHttpOkResult<TParams, TResult> = {
                        type: buildReduxHttpActionType(true, asyncWorkerId),
                        ok: true,
                        result,
                        params
                    };

                    return action;
                },
                (error: TError) => {
                    const errorAction: ReduxHttpErrorResult<TParams, TError> = {
                        type: buildReduxHttpActionType(true, asyncWorkerId),
                        ok: false,
                        isHttpError: false,
                        errors: error,
                        request: action as ReduxHttpCustomRequestAction<any>,
                        params
                    };

                    return errorAction;
                });
        };

        asyncWorkerId = registerAsyncWorkerAuto(worker);

        return new class {
            run(params: TParams): ReduxHttpCustomRequestAction<TParams> {
                return {
                    type: buildReduxHttpActionType(false, asyncWorkerId),
                    params
                };
            }

            isRunning(action: Action): action is ReduxHttpCustomRequestAction<TParams> {
                if (!action) {
                    return false;
                }

                const info = parseReduxHttpActionType(action.type);
                if (!info.isReduxHttpAction) {
                    return false;
                }

                return info.asyncWorkerId === asyncWorkerId && !info.isResult;
            }

            isMy(action: Action): action is ReduxHttpActionBase<TParams> {
                if (action && action.type) {
                    const info = parseReduxHttpActionType(action.type);
                    return info.isReduxHttpAction && info.asyncWorkerId === asyncWorkerId;
                }

                return false;
            }

            isResult(action: Action): action is (ReduxHttpOkResult<TParams, TResult> | ReduxHttpErrorResult<TParams, TError>) {
                if (!action) {
                    return false;
                }

                const info = parseReduxHttpActionType(action.type);
                if (!info.isReduxHttpAction) {
                    return false;
                }

                return info.asyncWorkerId === asyncWorkerId && info.isResult;
            }

            isOk(action: Action): action is ReduxHttpOkResult<TParams, TResult> {
                if (this.isResult(action)) {
                    return action.ok;
                }

                return false;
            }

            isError(action: Action): action is ReduxHttpErrorResult<TParams, TError> {
                if (this.isResult(action)) {
                    return !action.ok;
                }

                return false;
            }
        };
    }
}

export const async = new CustomRequestBuilder();