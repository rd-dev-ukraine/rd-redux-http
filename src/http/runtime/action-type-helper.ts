export type OperationType = "request" | "running" | "ok" | "error";

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

export function formatActionType<TParams>(
    requestId: string,
    name: string,
    operation: OperationType,
    method: string,
    urlTemplate: string | ((params: TParams) => string) | ((params: TParams) => Promise<string>)
): string {
    return `RD-REDUX-HTTP [${requestId}]${
        name ? " [" + name + "] " : " "
    }${operation.toUpperCase()} ${method.toUpperCase()} ${
        typeof urlTemplate === "function" ? "<dynamic url>" : urlTemplate
    }`;
}
