"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var actions_1 = require("./actions");
var url_builder_1 = require("./url-builder");
var counter = 1;
function createHttpRequest(config) {
    var result = (function (params, body) {
        params = config.prepareParams ? config.prepareParams(params) : params;
        var url = url_builder_1.urlFromParams(config.urlTemplate, config.appendRestOfParamsToQueryString, params);
        return url.then(function (url) {
            var request = (config.pre || []).reduce(function (request, pre) { return pre(request, params, body); }, new Request(url, {
                method: config.method
            }));
            var actualFetch = config.fetch || (function (request, params, body) { return fetch(request); });
            var processResponse = config.processResponse || defaultProcessResponseFactory(config);
            var postProcessResult = function (params, result) {
                return reduceAsync(config.post || [], function (fn, prevResult) { return fn(prevResult, params); }, result);
            };
            return actualFetch(request, params, body)
                .then(function (response) { return processResponse(response, params, body); }, function (error) {
                return Promise.resolve({
                    ok: false,
                    errorType: "transport",
                    reason: "fetch-rejected",
                    error: error
                });
            })
                .then(function (r) { return postProcessResult(params, r); });
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
function reduceAsync(src, runItem, initialResult) {
    if (initialResult === void 0) { initialResult = undefined; }
    return __awaiter(this, void 0, void 0, function () {
        var _i, src_1, currentItem;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, src_1 = src;
                    _a.label = 1;
                case 1:
                    if (!(_i < src_1.length)) return [3 /*break*/, 4];
                    currentItem = src_1[_i];
                    return [4 /*yield*/, runItem(currentItem, initialResult)];
                case 2:
                    initialResult = _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, initialResult];
            }
        });
    });
}
//# sourceMappingURL=http-request.js.map