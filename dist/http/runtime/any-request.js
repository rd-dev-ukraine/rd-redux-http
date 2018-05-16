"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var action_type_helper_1 = require("./action-type-helper");
var AnyActionTypeGuardsImpl = /** @class */ (function () {
    function AnyActionTypeGuardsImpl() {
    }
    AnyActionTypeGuardsImpl.prototype.isMy = function (action) {
        if (!action) {
            return false;
        }
        var match = action_type_helper_1.parseActionType(action.type);
        return match.isMatch;
    };
    AnyActionTypeGuardsImpl.prototype.isRunning = function (action) {
        if (!action) {
            return false;
        }
        var match = action_type_helper_1.parseActionType(action.type);
        return match.isMatch && match.operation === "running";
    };
    AnyActionTypeGuardsImpl.prototype.isOk = function (action) {
        if (!action) {
            return false;
        }
        var match = action_type_helper_1.parseActionType(action.type);
        return match.isMatch && match.operation === "ok";
    };
    AnyActionTypeGuardsImpl.prototype.isError = function (action) {
        if (!action) {
            return false;
        }
        var match = action_type_helper_1.parseActionType(action.type);
        return match.isMatch && match.operation === "error";
    };
    AnyActionTypeGuardsImpl.prototype.isErrorResponse = function (action) {
        return this.isError(action) && action.errorType === "response";
    };
    AnyActionTypeGuardsImpl.prototype.isAuthorizationError = function (action) {
        return this.isError(action) && action.errorType === "authorization";
    };
    AnyActionTypeGuardsImpl.prototype.isTransportError = function (action) {
        return this.isError(action) && action.errorType === "transport";
    };
    AnyActionTypeGuardsImpl.prototype.isCompleted = function (action) {
        return this.isOk(action) || this.isError(action);
    };
    AnyActionTypeGuardsImpl.prototype.isTriggering = function (action) {
        if (!action) {
            return false;
        }
        var match = action_type_helper_1.parseActionType(action.type);
        return match.isMatch && match.operation === "request";
    };
    return AnyActionTypeGuardsImpl;
}());
/** Type guards for matching any rd-redux-http action. */
exports.anyRequest = new AnyActionTypeGuardsImpl();
//# sourceMappingURL=any-request.js.map