"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FETCH_STATE_INITIAL = "initial";
exports.FETCH_STATE_LOADING = "loading";
exports.FETCH_STATE_SUCCESS = "success";
exports.FETCH_STATE_ERROR = "error";
/**
 * Calculates common state from a set of states.
 */
function calculateCommonState(state, options) {
    options = options || {
        waitForLoadingOnError: false
    };
    if (!state.length) {
        throw new Error("States are empty");
    }
    var unique = new Set(state);
    if (unique.has(exports.FETCH_STATE_LOADING)) {
        return unique.has(exports.FETCH_STATE_ERROR)
            ? options.waitForLoadingOnError
                ? exports.FETCH_STATE_LOADING
                : exports.FETCH_STATE_ERROR
            : exports.FETCH_STATE_LOADING;
    }
    if (unique.has(exports.FETCH_STATE_ERROR)) {
        return exports.FETCH_STATE_ERROR;
    }
    if (unique.has(exports.FETCH_STATE_INITIAL)) {
        return exports.FETCH_STATE_INITIAL;
    }
    return exports.FETCH_STATE_SUCCESS;
}
exports.calculateCommonState = calculateCommonState;
//# sourceMappingURL=fetch-state.js.map