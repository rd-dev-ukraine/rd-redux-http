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
function createActions(id, method, url, name) {
    return new ActionFactoryImpl(id, method, url, name);
}
exports.createActions = createActions;
var ActionFactoryImpl = /** @class */ (function () {
    function ActionFactoryImpl(requestId, method, url, name) {
        var _this = this;
        this.requestId = requestId;
        this.method = method;
        this.url = url;
        this.name = name;
        this.types = {
            get params() {
                throw new Error("Use this with Typescript typeof operator only");
            },
            get result() {
                throw new Error("Use this with Typescript typeof operator only");
            },
            get error() {
                throw new Error("Use this with Typescript typeof operator only");
            },
            get runningAction() {
                throw new Error("Use this with Typescript typeof operator only");
            },
            get okAction() {
                throw new Error("Use this with Typescript typeof operator only");
            },
            get errorAction() {
                throw new Error("Use this with Typescript typeof operator only");
            }
        };
        this.isMy = function (action) {
            var match = _this.match(action);
            return match.isMatch && match.requestId === _this.requestId;
        };
        this.isRunning = function (action) {
            var match = _this.match(action);
            return match.isMatch && match.requestId === _this.requestId && match.operation === "running";
        };
        this.isOk = function (action) {
            var match = _this.match(action);
            return match.isMatch && match.requestId === _this.requestId && match.operation === "ok";
        };
        this.isError = function (action) {
            var match = _this.match(action);
            return match.isMatch && match.requestId === _this.requestId && match.operation === "error";
        };
        this.isErrorResponse = function (action) {
            return _this.isError(action) && action.errorType === "response";
        };
        this.isAuthorizationError = function (action) {
            return _this.isError(action) && action.errorType === "authorization";
        };
        this.isTransportError = function (action) {
            return _this.isError(action) && action.errorType === "transport";
        };
        this.isCompleted = function (action) {
            return _this.isOk(action) || _this.isError(action);
        };
        this.running = function (params) {
            return {
                type: _this.actionType("running"),
                params: params
            };
        };
        this.ok = function (params, result) {
            return __assign({}, result, { type: _this.actionType("ok"), params: params });
        };
        this.error = function (params, error) {
            return __assign({ type: _this.actionType("error"), params: params }, error);
        };
        this.trigger = function (params, body) {
            if (body) {
                return {
                    type: _this.actionType("request"),
                    params: params,
                    body: body
                };
            }
            else {
                return {
                    type: _this.actionType("request"),
                    params: params
                };
            }
        };
        this.isTriggering = function (action) {
            var match = _this.match(action);
            return match.isMatch && match.operation === "request";
        };
        this.match = function (action) {
            if (!action) {
                return { isMatch: false };
            }
            return action_type_helper_1.parseActionType(action.type || "");
        };
        this.actionType = function (operation) {
            return action_type_helper_1.formatActionType(_this.requestId, _this.name, operation, _this.method, _this.url);
        };
    }
    return ActionFactoryImpl;
}());
//# sourceMappingURL=actions.js.map