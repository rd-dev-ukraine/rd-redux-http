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
var _1 = require(".");
function createReducer(httpRequest) {
    return function (state, action) {
        if (!state) {
            state = {
                fetchState: _1.FETCH_STATE_INITIAL
            };
        }
        if (httpRequest.actions.isRunning(action)) {
            return __assign({}, state, { error: undefined, params: action.params, fetchState: _1.FETCH_STATE_FETCHING });
        }
        if (httpRequest.actions.isOk(action)) {
            return __assign({}, state, { error: undefined, data: action.result, params: action.params, fetchState: _1.FETCH_STATE_SUCCESS });
        }
        if (httpRequest.actions.isError(action)) {
            return __assign({}, state, action, { params: action.params, fetchState: _1.FETCH_STATE_ERROR });
        }
        return state;
    };
}
exports.createReducer = createReducer;
//# sourceMappingURL=create-reducer.js.map