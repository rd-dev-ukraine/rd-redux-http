"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var action_helpers_1 = require("./action-helpers");
var async_workers_registry_1 = require("./async-workers-registry");
function reduxHttpMiddleware() {
    return function (store) { return function (dispatch) { return function (action) {
        var parseResult = action_helpers_1.parseReduxHttpActionType(action.type);
        if (parseResult.isReduxHttpAction && !parseResult.isResult) {
            var worker = async_workers_registry_1.retrieveWorker(parseResult.asyncWorkerId);
            worker(action).then(function (action) { return store.dispatch(action); });
        }
        return dispatch(action);
    }; }; };
}
exports.reduxHttpMiddleware = reduxHttpMiddleware;
//# sourceMappingURL=redux.js.map