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
Object.defineProperty(exports, "__esModule", { value: true });
var action_helpers_1 = require("./action-helpers");
var async_workers_registry_1 = require("./async-workers-registry");
var CustomRequestBuilder = (function (_super) {
    __extends(CustomRequestBuilder, _super);
    function CustomRequestBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CustomRequestBuilder.prototype.define = function (asyncWorker) {
        if (!asyncWorker) {
            throw new Error("Async worker is not provided.");
        }
        var asyncWorkerId = "";
        var worker = function (action) {
            var params = action.params;
            return asyncWorker(params)
                .then(function (result) {
                var action = {
                    type: action_helpers_1.buildReduxHttpActionType(true, asyncWorkerId),
                    ok: true,
                    result: result,
                    params: params
                };
                return action;
            }, function (error) {
                var errorAction = {
                    type: action_helpers_1.buildReduxHttpActionType(true, asyncWorkerId),
                    ok: false,
                    isHttpError: false,
                    errors: error,
                    request: action,
                    params: params
                };
                return errorAction;
            });
        };
        asyncWorkerId = async_workers_registry_1.registerAsyncWorkerAuto(worker);
        return new (function () {
            function class_1() {
            }
            class_1.prototype.run = function (params) {
                return {
                    type: action_helpers_1.buildReduxHttpActionType(false, asyncWorkerId),
                    params: params
                };
            };
            class_1.prototype.isRunning = function (action) {
                if (!action) {
                    return false;
                }
                var info = action_helpers_1.parseReduxHttpActionType(action.type);
                if (!info.isReduxHttpAction) {
                    return false;
                }
                return info.asyncWorkerId === asyncWorkerId && !info.isResult;
            };
            class_1.prototype.isMy = function (action) {
                if (action && action.type) {
                    var info = action_helpers_1.parseReduxHttpActionType(action.type);
                    return info.isReduxHttpAction && info.asyncWorkerId === asyncWorkerId;
                }
                return false;
            };
            class_1.prototype.isResult = function (action) {
                if (!action) {
                    return false;
                }
                var info = action_helpers_1.parseReduxHttpActionType(action.type);
                if (!info.isReduxHttpAction) {
                    return false;
                }
                return info.asyncWorkerId === asyncWorkerId && info.isResult;
            };
            class_1.prototype.isOk = function (action) {
                if (this.isResult(action)) {
                    return action.ok;
                }
                return false;
            };
            class_1.prototype.isError = function (action) {
                if (this.isResult(action)) {
                    return !action.ok;
                }
                return false;
            };
            return class_1;
        }());
    };
    return CustomRequestBuilder;
}(action_helpers_1.ReduxHttpCommonTypeGuard));
exports.CustomRequestBuilder = CustomRequestBuilder;
exports.async = new CustomRequestBuilder();
//# sourceMappingURL=custom-request.js.map