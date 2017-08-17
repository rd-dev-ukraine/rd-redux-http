export declare type OperationType = "run" | "result" | "error";
export interface MatchActionInfo {
    isMatch: true;
    requestId: string;
    operation: OperationType;
}
export declare function parseActionType(actionType: string): MatchActionInfo | {
    isMatch: false;
};
export declare function formatActionType(requestId: string, operation: OperationType, method: string, urlTemplate: string): string;
