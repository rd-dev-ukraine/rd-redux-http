"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var REDUX_HTTP_ACTION_PREFIX = "REDUX-HTTP";
var REQUEST = "REQUEST";
var RESPONSE = "RESPONSE";
function buildReduxHttpActionType(isResult, asyncWorkerId) {
    if (!asyncWorkerId) {
        throw new Error("Async worker identifier is not provided.");
    }
    isResult = isResult || false;
    return REDUX_HTTP_ACTION_PREFIX + ": " + (isResult ? RESPONSE : REQUEST) + ": " + asyncWorkerId;
}
exports.buildReduxHttpActionType = buildReduxHttpActionType;
function parseReduxHttpActionType(actionType) {
    var notReduxHttpAction = { isReduxHttpAction: false };
    if (!actionType || typeof actionType !== "string") {
        return notReduxHttpAction;
    }
    if (!actionType.startsWith(REDUX_HTTP_ACTION_PREFIX)) {
        return notReduxHttpAction;
    }
    var part = actionType.substring(REDUX_HTTP_ACTION_PREFIX.length + 1).trim();
    return {
        isReduxHttpAction: true,
        isResult: part.indexOf(RESPONSE) === 0,
        asyncWorkerId: part.substring(part.indexOf(":") + 1).trim()
    };
}
exports.parseReduxHttpActionType = parseReduxHttpActionType;
var ReduxHttpCommonTypeGuard = (function () {
    function ReduxHttpCommonTypeGuard() {
    }
    ReduxHttpCommonTypeGuard.prototype.isResult = function (action) {
        if (!action || !action.type) {
            return false;
        }
        var parseResult = parseReduxHttpActionType(action.type);
        return parseResult.isReduxHttpAction && parseResult.isResult;
    };
    ReduxHttpCommonTypeGuard.prototype.isOk = function (action) {
        if (this.isResult(action)) {
            return action.ok;
        }
        return false;
    };
    return ReduxHttpCommonTypeGuard;
}());
exports.ReduxHttpCommonTypeGuard = ReduxHttpCommonTypeGuard;
var ReduxHttpCustomRequestTypeGuard = (function (_super) {
    __extends(ReduxHttpCustomRequestTypeGuard, _super);
    function ReduxHttpCustomRequestTypeGuard() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ReduxHttpCustomRequestTypeGuard.prototype.isError = function (action) {
        if (this.isResult(action)) {
            return !action.ok;
        }
        return false;
    };
    return ReduxHttpCustomRequestTypeGuard;
}(ReduxHttpCommonTypeGuard));
exports.ReduxHttpCustomRequestTypeGuard = ReduxHttpCustomRequestTypeGuard;
var ReduxHttpFetchTypeGuard = (function (_super) {
    __extends(ReduxHttpFetchTypeGuard, _super);
    function ReduxHttpFetchTypeGuard() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ReduxHttpFetchTypeGuard.prototype.isError = function (action) {
        if (this.isResult(action)) {
            return !action.ok;
        }
        return false;
    };
    ReduxHttpFetchTypeGuard.prototype.isHttpTransportError = function (action) {
        if (this.isError(action)) {
            return action.isHttpError;
        }
        return false;
    };
    ReduxHttpFetchTypeGuard.prototype.isResultError = function (action) {
        if (this.isError(action)) {
            return !action.isHttpError;
        }
        return false;
    };
    ReduxHttpFetchTypeGuard.prototype.isAuthorizationError = function (action) {
        if (this.isHttpTransportError(action)) {
            return action.errors.error === "Not authorized";
        }
        return false;
    };
    return ReduxHttpFetchTypeGuard;
}(ReduxHttpCommonTypeGuard));
exports.ReduxHttpFetchTypeGuard = ReduxHttpFetchTypeGuard;
exports.customRequestTypeGuard = new ReduxHttpCustomRequestTypeGuard();
exports.fetchTypeGuard = new ReduxHttpFetchTypeGuard();
//# sourceMappingURL=action-helpers.js.map