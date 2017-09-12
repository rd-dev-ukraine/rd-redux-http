"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var action_type_helper_1 = require("./action-type-helper");
function createActions(id, method, url) {
    return new ActionFactoryImpl(id, method, url);
}
exports.createActions = createActions;
var ActionFactoryImpl = (function () {
    function ActionFactoryImpl(requestId, method, url) {
        this.requestId = requestId;
        this.method = method;
        this.url = url;
        this.types = {
            get params() { throw new Error("Use this with Typescript typeof operator only"); },
            get result() { throw new Error("Use this with Typescript typeof operator only"); },
            get error() { throw new Error("Use this with Typescript typeof operator only"); },
            get runningAction() { throw new Error("Use this with Typescript typeof operator only"); },
            get okAction() { throw new Error("Use this with Typescript typeof operator only"); },
            get errorAction() { throw new Error("Use this with Typescript typeof operator only"); },
        };
    }
    ActionFactoryImpl.prototype.isMy = function (action) {
        var match = this.match(action);
        return match.isMatch && match.requestId === this.requestId;
    };
    ActionFactoryImpl.prototype.isRunning = function (action) {
        var match = this.match(action);
        return match.isMatch &&
            match.requestId === this.requestId &&
            match.operation === "running";
    };
    ActionFactoryImpl.prototype.isOk = function (action) {
        var match = this.match(action);
        return match.isMatch &&
            match.requestId === this.requestId &&
            match.operation === "ok";
    };
    ActionFactoryImpl.prototype.isError = function (action) {
        var match = this.match(action);
        return match.isMatch &&
            match.requestId === this.requestId &&
            match.operation === "error";
    };
    ActionFactoryImpl.prototype.isErrorResponse = function (action) {
        return this.isError(action) && action.errorType === "response";
    };
    ActionFactoryImpl.prototype.isAuthorizationError = function (action) {
        return this.isError(action) && action.errorType === "authorization";
    };
    ActionFactoryImpl.prototype.isTransportError = function (action) {
        return this.isError(action) && action.errorType === "transport";
    };
    ActionFactoryImpl.prototype.isCompleted = function (action) {
        return this.isOk(action) || this.isError(action);
    };
    ActionFactoryImpl.prototype.running = function (params) {
        return {
            type: this.actionType("running"),
            params: params
        };
    };
    ActionFactoryImpl.prototype.ok = function (params, result) {
        return __assign({}, result, { type: this.actionType("ok"), params: params });
    };
    ActionFactoryImpl.prototype.error = function (params, error) {
        return __assign({ type: this.actionType("error"), params: params }, error);
    };
    ActionFactoryImpl.prototype.run = function (params, body) {
        if (body) {
            return {
                type: this.actionType("run"),
                params: params,
                body: body
            };
        }
        else {
            return {
                type: this.actionType("run"),
                params: params
            };
        }
    };
    ActionFactoryImpl.prototype.isRun = function (action) {
        var match = this.match(action);
        return match.isMatch && match.operation === "run";
    };
    ActionFactoryImpl.prototype.match = function (action) {
        if (!action) {
            return { isMatch: false };
        }
        return action_type_helper_1.parseActionType(action.type || "");
    };
    ActionFactoryImpl.prototype.actionType = function (operation) {
        return action_type_helper_1.formatActionType(this.requestId, operation, this.method, this.url);
    };
    return ActionFactoryImpl;
}());
//# sourceMappingURL=actions.js.map