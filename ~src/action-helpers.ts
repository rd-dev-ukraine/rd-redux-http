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

const REDUX_HTTP_ACTION_PREFIX = "REDUX-HTTP";

const REQUEST = "REQUEST";
const RESPONSE = "RESPONSE";

/**
 * Builds action type for redux-http action.
 * @param isResult True to build action for operation result action, false otherwise.
 * @param asyncWorkerId Identifier of the function in async worker registry used for running the action.
 * @returns A string unique identifies redux-http action.
 */
export function buildReduxHttpActionType(isResult: boolean, asyncWorkerId: string): string {
    if (!asyncWorkerId) {
        throw new Error("Async worker identifier is not provided.");
    }

    isResult = isResult || false;

    return `${REDUX_HTTP_ACTION_PREFIX}: ${isResult ? RESPONSE : REQUEST}: ${asyncWorkerId}`;
}

/**
 * Checks if provided action type string is redux-http action type and parse information in it.
 *
 * @param actionType Action type which can be encoded redux-http action type descriptor or regular action type.
 * @returns An action descriptor or object indicates that action type is not redux-http action.
 */
export function parseReduxHttpActionType(actionType: string): NotReduxHttpAction | ReduxHttpActionTypeDescriptor {

    const notReduxHttpAction: NotReduxHttpAction = { isReduxHttpAction: false };

    if (!actionType || typeof actionType !== "string") {
        return notReduxHttpAction;
    }

    if (!actionType.startsWith(REDUX_HTTP_ACTION_PREFIX)) {
        return notReduxHttpAction;
    }

    const part = actionType.substring(REDUX_HTTP_ACTION_PREFIX.length + 1).trim();


    return {
        isReduxHttpAction: true,
        isResult: part.indexOf(RESPONSE) === 0,
        asyncWorkerId: part.substring(part.indexOf(":") + 1).trim()
    };
}

export class ReduxHttpCommonTypeGuard implements ReduxHttpResultConfig<any, any, any> {
    isResult(action: Action): action is ReduxHttpErrorResult<any, any> | ReduxHttpOkResult<any, any> {
        if (!action || !action.type) {
            return false;
        }

        const parseResult = parseReduxHttpActionType(action.type);

        return parseResult.isReduxHttpAction && parseResult.isResult;
    }

    isOk(action: Action): action is ReduxHttpOkResult<any, any> {
        if (this.isResult(action)) {
            return action.ok;
        }

        return false;
    }
}

export class ReduxHttpCustomRequestTypeGuard extends ReduxHttpCommonTypeGuard implements ReduxHttpCustomRequestResultConfig<any, any, any> {

    isError(action: Action): action is ReduxHttpErrorResult<any, any> {
        if (this.isResult(action)) {
            return !action.ok;
        }

        return false;
    }
}

export class ReduxHttpFetchTypeGuard extends ReduxHttpCommonTypeGuard implements ReduxHttpFetchResultConfig<any, any, any> {

    isError(action: Action): action is ReduxHttpTransportError<any> | ReduxHttpErrorResult<any, any> {
        if (this.isResult(action)) {
            return !action.ok;
        }

        return false;
    }

    isHttpTransportError(action: Action): action is ReduxHttpTransportError<any> {
        if (this.isError(action)) {
            return action.isHttpError;
        }

        return false;
    }

    isResultError(action: Action): action is ReduxHttpErrorResult<any, any> {
        if (this.isError(action)) {
            return !action.isHttpError;
        }

        return false;
    }

    isAuthorizationError(action: Action): action is ReduxHttpTransportError<any> {
        if (this.isHttpTransportError(action)) {
            return action.errors.error === "Not authorized";
        }

        return false;
    }
}

export const customRequestTypeGuard = new ReduxHttpCustomRequestTypeGuard();

export const fetchTypeGuard = new ReduxHttpFetchTypeGuard();