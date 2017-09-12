export type OperationType = "run" | "running" | "ok" | "error";

export interface MatchActionInfo {
    isMatch: true;
    requestId: string;
    operation: OperationType;
}

const NoMatch: { isMatch: false } = { isMatch: false };

const matchActionRegex = /^RD-REDUX-HTTP \[(\d+)] (\w+)/i;

export function parseActionType(actionType: string): MatchActionInfo | { isMatch: false } {
    if (!actionType) {
        return NoMatch;
    }

    const result = matchActionRegex.exec(actionType);
    if (!result || result.length !== 3 || !result[1] || !result[2]) {
        return NoMatch;
    }

    return {
        isMatch: true,
        requestId: result[1],
        operation: result[2].toLowerCase() as any
    };
}

export function formatActionType(requestId: string, operation: OperationType, method: string, urlTemplate: string): string {
    return `RD-REDUX-HTTP [${requestId}] ${operation.toUpperCase()} ${method.toUpperCase()} ${urlTemplate}`;
}