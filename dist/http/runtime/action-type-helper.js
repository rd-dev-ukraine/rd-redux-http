"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NoMatch = { isMatch: false };
var matchActionRegex = /^RD-REDUX-HTTP \[(\d+)] (\w+)/i;
function parseActionType(actionType) {
    if (!actionType) {
        return NoMatch;
    }
    var result = matchActionRegex.exec(actionType);
    if (!result || result.length !== 3 || !result[1] || !result[2]) {
        return NoMatch;
    }
    return {
        isMatch: true,
        requestId: result[1],
        operation: result[2].toLowerCase()
    };
}
exports.parseActionType = parseActionType;
function formatActionType(requestId, name, operation, method, urlTemplate) {
    return "RD-REDUX-HTTP [" + requestId + "]" + (name ? " [" + name + "] " : " ") + operation.toUpperCase() + " " + method.toUpperCase() + " " + (typeof urlTemplate === "function" ? "<dynamic url>" : urlTemplate);
}
exports.formatActionType = formatActionType;
//# sourceMappingURL=action-type-helper.js.map