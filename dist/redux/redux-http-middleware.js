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
var request_registry_1 = require("./request-registry");
function reduxHttpMiddleware() {
    var registry = new request_registry_1.RequestRegistry();
    var mw = (function (store) { return function (dispatch) { return function (action) {
        var parsedAction = action_type_helper_1.parseActionType(action.type);
        if (parsedAction.isMatch && parsedAction.operation === "run") {
            var request_1 = registry.take(parsedAction.requestId);
            var typedAction_1 = action;
            if (request_1) {
                request_1(typedAction_1.params, typedAction_1.body)
                    .then(function (result) {
                    var resultAction = __assign({}, result, { type: action_type_helper_1.formatActionType(parsedAction.requestId, result.ok ? "result" : "error", request_1.method, request_1.urlTemplate), params: typedAction_1.params });
                    store.dispatch(resultAction);
                });
            }
        }
        return dispatch(action);
    }; }; });
    mw.register = function (request) {
        if (!request) {
            throw new Error("HttpRequest object is not defined.");
        }
        var requestId = registry.register(request);
        var requestTyped = request;
        function testRequestAction(action, operation) {
            if (!action) {
                return false;
            }
            var result = action_type_helper_1.parseActionType(action.type);
            return result.isMatch &&
                result.requestId === requestId &&
                (!operation || result.operation === operation);
        }
        ;
        function isError(action) {
            return testRequestAction(action, "error");
        }
        function makeActionType(operation) {
            return action_type_helper_1.formatActionType(requestId, operation, requestTyped.method, requestTyped.urlTemplate);
        }
        request.isMy = function (action) { return testRequestAction(action); };
        request.isRunning = function (action) { return testRequestAction(action, "run"); };
        request.isOk = function (action) { return testRequestAction(action, "result"); };
        request.isError = isError;
        request.isErrorResponse = function (action) { return isError(action) && action.errorType === "response"; };
        request.isAuthorizationError = function (action) { return isError(action) && action.errorType === "authorization"; };
        request.isTransportError = function (action) { return isError(action) && action.errorType === "transport"; };
        request.run = function (params, body) { return ({
            type: makeActionType("run"),
            params: params,
            body: body
        }); };
        return request;
    };
    return mw;
}
exports.reduxHttpMiddleware = reduxHttpMiddleware;
//# sourceMappingURL=redux-http-middleware.js.map