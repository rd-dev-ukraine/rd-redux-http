"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var action_type_helper_1 = require("./action-type-helper");
var counter = 0;
function createLifecycleActions(method, url) {
    return new LifecycleActionsImpl("" + counter++, method, url);
}
exports.createLifecycleActions = createLifecycleActions;
var LifecycleActionsImpl = (function () {
    function LifecycleActionsImpl(requestId, method, url) {
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
    LifecycleActionsImpl.prototype.isMy = function (action) {
        var match = this.match(action);
        return match.isMatch && match.requestId === this.requestId;
    };
    LifecycleActionsImpl.prototype.isRunning = function (action) {
        var match = this.match(action);
        return match.isMatch &&
            match.requestId === this.requestId &&
            match.operation === "running";
    };
    LifecycleActionsImpl.prototype.isOk = function (action) {
        var match = this.match(action);
        return match.isMatch &&
            match.requestId === this.requestId &&
            match.operation === "ok";
    };
    LifecycleActionsImpl.prototype.isError = function (action) {
        var match = this.match(action);
        return match.isMatch &&
            match.requestId === this.requestId &&
            match.operation === "error";
    };
    LifecycleActionsImpl.prototype.isCompleted = function (action) {
        return this.isOk(action) || this.isError(action);
    };
    LifecycleActionsImpl.prototype.running = function (params) {
        return {
            type: this.actionType("running"),
            params: params
        };
    };
    LifecycleActionsImpl.prototype.ok = function (params, result) {
        return {
            type: this.actionType("ok"),
            ok: true,
            params: params,
            result: result
        };
    };
    LifecycleActionsImpl.prototype.error = function (params, error) {
        return {
            type: this.actionType("error"),
            ok: false,
            params: params,
            error: error
        };
    };
    LifecycleActionsImpl.prototype.match = function (action) {
        if (!action) {
            return { isMatch: false };
        }
        return action_type_helper_1.parseActionType(action.type || "");
    };
    LifecycleActionsImpl.prototype.actionType = function (operation) {
        return action_type_helper_1.formatActionType(this.requestId, operation, this.method, this.url);
    };
    return LifecycleActionsImpl;
}());
//# sourceMappingURL=lifecycle-actions.js.map