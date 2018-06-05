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
/**
 * Type guard checks if state contains non-emtpy data value.
 */
function hasFetchingData(state) {
    return !!state && state.fetchState !== fetch_state_1.FETCH_STATE_INITIAL && !!state.data;
}
exports.hasFetchingData = hasFetchingData;
/**
 * If state object contains non-empty data, returns that value, otherwise return default data value.
 */
function getFetchingDataOrDefault(state, defaultData) {
    return hasFetchingData(state) ? state.data || defaultData : defaultData;
}
exports.getFetchingDataOrDefault = getFetchingDataOrDefault;
//# sourceMappingURL=http-request-redux.js.map