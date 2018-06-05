"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fetch_state_1 = require("./fetch-state");
function isFetchingStateInitial(state) {
    return !!state && state.fetchState === fetch_state_1.FETCH_STATE_INITIAL;
}
exports.isFetchingStateInitial = isFetchingStateInitial;
function isFetchingStateFetching(state) {
    return !!state && state.fetchState === fetch_state_1.FETCH_STATE_FETCHING;
}
exports.isFetchingStateFetching = isFetchingStateFetching;
function isFetchingStateSuccess(state) {
    return !!state && state.fetchState === fetch_state_1.FETCH_STATE_SUCCESS;
}
exports.isFetchingStateSuccess = isFetchingStateSuccess;
function isFetchingStateError(state) {
    return !!state && state.fetchState === fetch_state_1.FETCH_STATE_ERROR;
}
exports.isFetchingStateError = isFetchingStateError;
//# sourceMappingURL=http-request-redux.js.map