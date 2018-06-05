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
var action_type_helper_1 = require("../http/runtime/action-type-helper");
var request_registry_1 = require("./request-registry");
var create_reducer_1 = require("./create-reducer");
/**
 * Factory for creating middlewares for rd-redux-http integration with redux.
 * One middleware per store is enough usually :)
 */
function reduxHttpMiddlewareFactory() {
    var registry = new request_registry_1.RequestRegistry();
    var mw = (function (store) { return function (dispatch) { return function (action) {
        var parsedAction = action_type_helper_1.parseActionType(action.type);
        if (parsedAction.isMatch && parsedAction.operation === "request") {
            var _a = registry.take(parsedAction.requestId), request_1 = _a.request, transform_1 = _a.transform;
            var typedAction_1 = action;
            if (request_1) {
                store.dispatch(request_1.actions.running(typedAction_1.params));
                request_1(typedAction_1.params, typedAction_1.body).then(function (response) {
                    var resultAction = response.ok
                        ? request_1.actions.ok(typedAction_1.params, __assign({}, response, { result: transform_1(response.result, typedAction_1.params, typedAction_1.body) }))
                        : request_1.actions.error(typedAction_1.params, response);
                    store.dispatch(resultAction);
                });
            }
        }
        return dispatch(action);
    }; }; });
    mw.register = function (request, transform) {
        if (!request) {
            throw new Error("HttpRequest object is not defined.");
        }
        registry.register(request, transform || (function (r) { return r; }));
        var requestTyped = request;
        request.trigger = function (params, body) { return requestTyped.actions.trigger(params, body); };
        request.isTriggering = function (action) { return requestTyped.actions.isTriggering(action); };
        request.reducer = create_reducer_1.createReducer(request);
        return request;
    };
    return mw;
}
exports.reduxHttpMiddlewareFactory = reduxHttpMiddlewareFactory;
//# sourceMappingURL=redux-http-middleware.js.map