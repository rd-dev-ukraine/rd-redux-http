import { Action } from "redux";
import { ReduxHttpTransportError, ReduxHttpErrorResult, ReduxHttpFetchResultConfig, ReduxHttpOkResult, ReduxHttpResultConfig, ReduxHttpCustomRequestResultConfig } from "./api";
export interface NotReduxHttpAction {
    isReduxHttpAction: false;
}
export interface ReduxHttpActionTypeDescriptor {
    isReduxHttpAction: true;
    isResult: boolean;
    asyncWorkerId: string;
}
export declare function buildReduxHttpActionType(isResult: boolean, asyncWorkerId: string): string;
export declare function parseReduxHttpActionType(actionType: string): NotReduxHttpAction | ReduxHttpActionTypeDescriptor;
export declare class ReduxHttpCommonTypeGuard implements ReduxHttpResultConfig<any, any, any> {
    isResult(action: Action): action is ReduxHttpErrorResult<any, any> | ReduxHttpOkResult<any, any>;
    isOk(action: Action): action is ReduxHttpOkResult<any, any>;
}
export declare class ReduxHttpCustomRequestTypeGuard extends ReduxHttpCommonTypeGuard implements ReduxHttpCustomRequestResultConfig<any, any, any> {
    isError(action: Action): action is ReduxHttpErrorResult<any, any>;
}
export declare class ReduxHttpFetchTypeGuard extends ReduxHttpCommonTypeGuard implements ReduxHttpFetchResultConfig<any, any, any> {
    isError(action: Action): action is ReduxHttpTransportError<any> | ReduxHttpErrorResult<any, any>;
    isHttpTransportError(action: Action): action is ReduxHttpTransportError<any>;
    isResultError(action: Action): action is ReduxHttpErrorResult<any, any>;
    isAuthorizationError(action: Action): action is ReduxHttpTransportError<any>;
}
export declare const customRequestTypeGuard: ReduxHttpCustomRequestTypeGuard;
export declare const fetchTypeGuard: ReduxHttpFetchTypeGuard;
