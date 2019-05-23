"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var any_request_1 = require("../http/runtime/any-request");
exports.FETCH_STATE_INITIAL = "initial";
exports.FETCH_STATE_FETCHING = "fetching";
exports.FETCH_STATE_SUCCESS = "ok";
exports.FETCH_STATE_ERROR = "error";
var FetchingState = /** @class */ (function () {
    function FetchingState() {
    }
    FetchingState.compose = function (state, options) {
        options = options || { waitForLoadingOnError: false };
        if (!state.length) {
            throw new Error("States are empty");
        }
        var unique = new Set(state);
        if (unique.has(exports.FETCH_STATE_FETCHING)) {
            return unique.has(exports.FETCH_STATE_ERROR)
                ? options.waitForLoadingOnError
                    ? exports.FETCH_STATE_FETCHING
                    : exports.FETCH_STATE_ERROR
                : exports.FETCH_STATE_FETCHING;
        }
        if (unique.has(exports.FETCH_STATE_ERROR)) {
            return exports.FETCH_STATE_ERROR;
        }
        if (unique.has(exports.FETCH_STATE_INITIAL)) {
            return exports.FETCH_STATE_INITIAL;
        }
        return exports.FETCH_STATE_SUCCESS;
    };
    FetchingState.INITIAL = exports.FETCH_STATE_INITIAL;
    FetchingState.FETCHING = exports.FETCH_STATE_FETCHING;
    FetchingState.SUCCESS = exports.FETCH_STATE_SUCCESS;
    FetchingState.ERROR = exports.FETCH_STATE_ERROR;
    FetchingState.isInitial = function (state) { return !!state && state.fetchState === exports.FETCH_STATE_INITIAL; };
    FetchingState.isFetching = function (state) { return !!state && state.fetchState === exports.FETCH_STATE_FETCHING; };
    FetchingState.isInitialOrFetching = function (state) {
        return FetchingState.isInitial(state) || FetchingState.isFetching(state);
    };
    FetchingState.isSuccess = function (state) { return !!state && state.fetchState === exports.FETCH_STATE_SUCCESS; };
    FetchingState.isError = function (state) { return !!state && state.fetchState === exports.FETCH_STATE_ERROR; };
    FetchingState.hasData = function (state) { return !!state && state.fetchState !== exports.FETCH_STATE_INITIAL && !!state.data; };
    FetchingState.hasParams = function (state) { return !!state && state.fetchState !== exports.FETCH_STATE_INITIAL; };
    FetchingState.getDataOrDefault = function (state, defaultData) {
        return FetchingState.hasData(state) ? state.data || defaultData : defaultData;
    };
    FetchingState.getErrorResult = function (state) {
        if (FetchingState.isError(state)) {
            switch (state.errorType) {
                case "authorization": {
                    var result = {
                        ok: false,
                        errorType: "authorization",
                        status: state.status
                    };
                    return result;
                }
                case "response": {
                    var result = {
                        ok: false,
                        errorType: "response",
                        error: state.error
                    };
                    return result;
                }
                case "transport": {
                    var result = {
                        ok: false,
                        errorType: "transport",
                        reason: state.reason,
                        statusCode: state.statusCode,
                        error: state.error
                    };
                    return result;
                }
            }
        }
        return undefined;
    };
    FetchingState.getError = function (state) {
        var result = FetchingState.getErrorResult(state);
        if (!result || result.errorType !== "response") {
            return undefined;
        }
        return result.error;
    };
    FetchingState.fromAction = function (action, defaultState) {
        if (defaultState === void 0) { defaultState = exports.FETCH_STATE_INITIAL; }
        if (any_request_1.anyRequest.isRunning(action)) {
            return exports.FETCH_STATE_FETCHING;
        }
        if (any_request_1.anyRequest.isOk(action)) {
            return exports.FETCH_STATE_SUCCESS;
        }
        if (any_request_1.anyRequest.isError(action)) {
            return exports.FETCH_STATE_ERROR;
        }
        return defaultState || exports.FETCH_STATE_INITIAL;
    };
    return FetchingState;
}());
exports.FetchingState = FetchingState;
//# sourceMappingURL=fetch-state.js.map