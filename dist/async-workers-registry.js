"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = require("uuid");
var registry = {};
function registerAsyncWorkerAuto(asyncWorker) {
    if (!asyncWorker) {
        throw new Error("Async worker is not provided.");
    }
    var id = uuid_1.v4();
    registry[id] = asyncWorker;
    return id;
}
exports.registerAsyncWorkerAuto = registerAsyncWorkerAuto;
function registerAsyncWorker(key, asynWorker) {
    if (!key) {
        throw new Error("Worker key is not provided.");
    }
    if (!asynWorker) {
        throw new Error("Async worker is not provided.");
    }
    registry[key] = asynWorker;
}
exports.registerAsyncWorker = registerAsyncWorker;
function retrieveWorker(asyncWorkerID) {
    if (!asyncWorkerID) {
        throw new Error("Async worker identifier is not provided.");
    }
    var fn = registry[asyncWorkerID];
    if (!fn) {
        throw new Error("Async worker with such ID is not registered.");
    }
    return fn;
}
exports.retrieveWorker = retrieveWorker;
//# sourceMappingURL=async-workers-registry.js.map