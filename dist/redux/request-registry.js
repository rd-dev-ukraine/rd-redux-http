"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RequestRegistry = (function () {
    function RequestRegistry() {
        this.map = {};
        this.lastRequestId = 0;
    }
    RequestRegistry.prototype.register = function (request) {
        if (!request) {
            throw new Error("Http Request object is not defined.");
        }
        this.lastRequestId++;
        this.map[this.lastRequestId] = request;
        return "" + this.lastRequestId;
    };
    RequestRegistry.prototype.take = function (requestId) {
        if (!requestId) {
            throw new Error("Request ID is not deinfed.");
        }
        return this.map[requestId];
    };
    return RequestRegistry;
}());
exports.RequestRegistry = RequestRegistry;
//# sourceMappingURL=request-registry.js.map