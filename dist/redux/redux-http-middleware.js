"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var action_type_helper_1 = require("../http/runtime/action-type-helper");
var request_registry_1 = require("./request-registry");
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
                request_1(typedAction_1.params, typedAction_1.body)
                    .then(function (result) {
                    var resultAction = result.ok
                        ? request_1.actions.ok(typedAction_1.params, transform_1(result))
                        : request_1.actions.error(typedAction_1.params, result);
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
        request.request = function (params, body) { return requestTyped.actions.request(params, body); };
        request.isRequesting = function (action) { return requestTyped.actions.isRequesting(action); };
        return request;
    };
    return mw;
}
exports.reduxHttpMiddlewareFactory = reduxHttpMiddlewareFactory;
//# sourceMappingURL=redux-http-middleware.js.map