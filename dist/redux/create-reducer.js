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
function createReducer(httpRequest) {
    return function (state, action) {
        if (!state) {
            state = {
                fetchState: "initial"
            };
        }
        if (httpRequest.actions.isRunning(action)) {
            return __assign({}, state, { error: undefined, params: action.params, fetchState: "loading" });
        }
        if (httpRequest.actions.isOk(action)) {
            return __assign({}, state, { error: undefined, data: action.result, params: action.params, fetchState: "successful" });
        }
        if (httpRequest.actions.isError(action)) {
            return __assign({}, state, { error: action, params: action.params, fetchState: "error" });
        }
        return state;
    };
}
exports.createReducer = createReducer;
//# sourceMappingURL=create-reducer.js.map