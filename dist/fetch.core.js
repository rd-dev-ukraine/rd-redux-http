"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var action_helpers_1 = require("./action-helpers");
var async_workers_registry_1 = require("./async-workers-registry");
var ReduxHttpResultActionTypeGuard = (function () {
    function ReduxHttpResultActionTypeGuard(asyncWorkerId) {
        this.asyncWorkerId = asyncWorkerId;
        if (!asyncWorkerId) {
            throw new Error("Async Worker ID is not defined.");
        }
    }
    ReduxHttpResultActionTypeGuard.prototype.isResult = function (action) {
        return action_helpers_1.fetchTypeGuard.isResult(action) && this.isOwnAction(action);
    };
    ReduxHttpResultActionTypeGuard.prototype.isOk = function (action) {
        return action_helpers_1.fetchTypeGuard.isOk(action) && this.isOwnAction(action);
    };
    ReduxHttpResultActionTypeGuard.prototype.isError = function (action) {
        return action_helpers_1.fetchTypeGuard.isError(action) && this.isOwnAction(action);
    };
    ReduxHttpResultActionTypeGuard.prototype.isHttpTransportError = function (action) {
        return action_helpers_1.fetchTypeGuard.isHttpTransportError(action) && this.isOwnAction(action);
    };
    ReduxHttpResultActionTypeGuard.prototype.isAuthorizationError = function (action) {
        return action_helpers_1.fetchTypeGuard.isAuthorizationError(action) && this.isOwnAction(action);
    };
    ReduxHttpResultActionTypeGuard.prototype.isResultError = function (action) {
        return action_helpers_1.fetchTypeGuard.isResultError(action) && this.isOwnAction(action);
    };
    ReduxHttpResultActionTypeGuard.prototype.isOwnAction = function (action) {
        if (!action || !action.type) {
            return false;
        }
        var info = action_helpers_1.parseReduxHttpActionType("" + action.type);
        return info.isReduxHttpAction && info.asyncWorkerId === this.asyncWorkerId;
    };
    return ReduxHttpResultActionTypeGuard;
}());
exports.ReduxHttpResultActionTypeGuard = ReduxHttpResultActionTypeGuard;
var ReduxHttpFetchRequestBase = (function (_super) {
    __extends(ReduxHttpFetchRequestBase, _super);
    function ReduxHttpFetchRequestBase(configuration) {
        var _this = _super.call(this, configuration.method + " " + configuration.url) || this;
        _this.configuration = configuration;
        if (!configuration) {
            throw new Error("Configuration is not defined.");
        }
        async_workers_registry_1.registerAsyncWorker(_this.asyncWorkerId, _this.createWorker(_this.configuration));
        return _this;
    }
    ReduxHttpFetchRequestBase.prototype.createWorker = function (configuration) {
        var _this = this;
        return function (action) {
            var _a = action, params = _a.params, body = _a.body;
            var request = (configuration.pre || []).reduce(function (r, pre) { return pre(r, params, body); }, {
                method: configuration.method
            });
            var actualFetch = ("fetch" in window) ? window.fetch : configuration.fetch;
            var runResult = actualFetch(new Request(request.url, request));
            return _this.defaultResultProcessor(runResult, action, params, body);
        };
    };
    ReduxHttpFetchRequestBase.prototype.defaultResultProcessor = function (result, action, params, body) {
        var _this = this;
        return result.then(function (response) {
            if (response.ok || response.status === 400) {
                return response.clone().json()
                    .then(function (result) {
                    if (response.ok) {
                        var okResult = {
                            type: action_helpers_1.buildReduxHttpActionType(true, _this.asyncWorkerId),
                            ok: true,
                            params: params,
                            result: result
                        };
                        return okResult;
                    }
                    else {
                        var errorResult = {
                            type: action_helpers_1.buildReduxHttpActionType(true, _this.asyncWorkerId),
                            ok: false,
                            errors: result,
                            isHttpError: false,
                            request: action,
                            params: params
                        };
                        return errorResult;
                    }
                })
                    .catch(function (err) { return __awaiter(_this, void 0, void 0, function () {
                    var errorResult, _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _a = {
                                    type: action_helpers_1.buildReduxHttpActionType(true, this.asyncWorkerId),
                                    ok: false
                                };
                                return [4, response.clone().text().then(function (res) { return res; })];
                            case 1:
                                errorResult = (_a.errors = (_b.sent()),
                                    _a.isHttpError = false,
                                    _a.request = action,
                                    _a.params = params,
                                    _a);
                                return [2, errorResult];
                        }
                    });
                }); });
            }
            else {
                var error = {
                    type: action_helpers_1.buildReduxHttpActionType(true, _this.asyncWorkerId),
                    ok: false,
                    isHttpError: true,
                    isAuthorizationError: response.status === 401,
                    status: response.status,
                    errors: {
                        error: response.status === 401 ? "Not authorized" : "Status Code",
                        details: response.statusText
                    },
                    request: action,
                    params: params
                };
                return error;
            }
        }, function (err) {
            var error = {
                type: action_helpers_1.buildReduxHttpActionType(true, _this.asyncWorkerId),
                ok: false,
                isHttpError: true,
                isAuthorizationError: false,
                status: undefined,
                errors: {
                    error: "Transport Error",
                    details: "" + err
                },
                request: action,
                params: params
            };
            return Promise.resolve(error);
        });
    };
    ReduxHttpFetchRequestBase.prototype.isRunningCore = function (action) {
        if (!action || !action.type) {
            return false;
        }
        var info = action_helpers_1.parseReduxHttpActionType("" + action.type);
        if (info.isReduxHttpAction) {
            return !info.isResult && info.asyncWorkerId === this.asyncWorkerId;
        }
        return false;
    };
    return ReduxHttpFetchRequestBase;
}(ReduxHttpResultActionTypeGuard));
exports.ReduxHttpFetchRequestBase = ReduxHttpFetchRequestBase;
var ReduxHttpFetchRequestWithParams = (function (_super) {
    __extends(ReduxHttpFetchRequestWithParams, _super);
    function ReduxHttpFetchRequestWithParams() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ReduxHttpFetchRequestWithParams.prototype.run = function (params) {
        return {
            type: action_helpers_1.buildReduxHttpActionType(false, this.asyncWorkerId),
            params: params
        };
    };
    ReduxHttpFetchRequestWithParams.prototype.isRunning = function (action) {
        return this.isRunningCore(action);
    };
    ReduxHttpFetchRequestWithParams.prototype.isMy = function (action) {
        if (action && action.type) {
            var info = action_helpers_1.parseReduxHttpActionType(action.type);
            return info.isReduxHttpAction && info.asyncWorkerId === this.asyncWorkerId;
        }
        return false;
    };
    return ReduxHttpFetchRequestWithParams;
}(ReduxHttpFetchRequestBase));
exports.ReduxHttpFetchRequestWithParams = ReduxHttpFetchRequestWithParams;
var ReduxHttpFetchRequestWithBody = (function (_super) {
    __extends(ReduxHttpFetchRequestWithBody, _super);
    function ReduxHttpFetchRequestWithBody() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ReduxHttpFetchRequestWithBody.prototype.run = function (params, body) {
        return {
            type: action_helpers_1.buildReduxHttpActionType(false, this.asyncWorkerId),
            params: params,
            body: body
        };
    };
    ReduxHttpFetchRequestWithBody.prototype.isRunning = function (action) {
        return this.isRunningCore(action);
    };
    ReduxHttpFetchRequestWithBody.prototype.isMy = function (action) {
        if (action && action.type) {
            var info = action_helpers_1.parseReduxHttpActionType(action.type);
            return info.isReduxHttpAction && info.asyncWorkerId === this.asyncWorkerId;
        }
        return false;
    };
    return ReduxHttpFetchRequestWithBody;
}(ReduxHttpFetchRequestBase));
exports.ReduxHttpFetchRequestWithBody = ReduxHttpFetchRequestWithBody;
//# sourceMappingURL=fetch.core.js.map