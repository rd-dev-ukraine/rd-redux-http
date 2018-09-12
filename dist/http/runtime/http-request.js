"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var actions_1 = require("./actions");
var url_builder_1 = require("./url-builder");
var counter = 1;
function createHttpRequest(config) {
    var result = (function (params, body) {
        var url = url_builder_1.urlFromParams(config.urlTemplate, config.appendRestOfParamsToQueryString, params);
        return url.then(function (url) {
            var request = (config.pre || []).reduce(function (request, pre) { return pre(request, params, body); }, new Request(url, {
                method: config.method
            }));
            var actualFetch = config.fetch || (function (request, params, body) { return fetch(request); });
            var processResponse = config.processResponse || defaultProcessResponseFactory(config);
            return actualFetch(request, params, body).then(function (response) { return processResponse(response, params, body); }, function (error) {
                return Promise.resolve({
                    ok: false,
                    errorType: "transport",
                    reason: "fetch-rejected",
                    error: error
                });
            });
        });
    });
    result.id = "" + counter++;
    result.actions = actions_1.createActions(result.id, config.method, config.urlTemplate, config.name);
    result.types = new HttpTypes();
    result.method = config.method;
    result.urlTemplate = config.urlTemplate;
    result.requestName = config.name;
    return result;
}
exports.createHttpRequest = createHttpRequest;
function defaultProcessResponseFactory(config) {
    var convertResult = config.convertResult || (function (response) { return response.clone().json(); });
    return function (response, params, body) {
        if (response.ok || response.status === 400) {
            return convertResult(response.clone(), response.ok, params).then(function (parsed) {
                if (response.ok) {
                    var result = {
                        ok: true,
                        result: parsed
                    };
                    return result;
                }
                else {
                    var error = {
                        ok: false,
                        errorType: "response",
                        error: parsed
                    };
                    return error;
                }
            }, function (err) {
                return Promise.resolve({
                    ok: false,
                    errorType: "transport",
                    reason: "invalid-body",
                    statusCode: response.status,
                    error: err
                });
            });
        }
        else {
            if (response.status === 401 || response.status === 403) {
                var errorResult = {
                    ok: false,
                    errorType: "authorization",
                    status: response.status
                };
                return Promise.resolve(errorResult);
            }
            else {
                var errorResult = {
                    ok: false,
                    errorType: "transport",
                    error: response.statusText,
                    reason: "other",
                    statusCode: response.status
                };
                return Promise.resolve(errorResult);
            }
        }
    };
}
var HttpTypes = /** @class */ (function () {
    function HttpTypes() {
    }
    Object.defineProperty(HttpTypes.prototype, "params", {
        get: function () {
            throw new Error("Use this in Typescript typeof expression only.");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpTypes.prototype, "okResult", {
        get: function () {
            throw new Error("Use this in Typescript typeof expression only.");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpTypes.prototype, "errorResult", {
        get: function () {
            throw new Error("Use this in Typescript typeof expression only.");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpTypes.prototype, "response", {
        get: function () {
            throw new Error("Use this in Typescript typeof expression only.");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpTypes.prototype, "body", {
        get: function () {
            throw new Error("Use this in Typescript typeof construct");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpTypes.prototype, "reduxState", {
        get: function () {
            throw new Error("Use this in Typescript typeof expression only.");
        },
        enumerable: true,
        configurable: true
    });
    return HttpTypes;
}());
//# sourceMappingURL=http-request.js.map