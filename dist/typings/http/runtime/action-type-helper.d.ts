export declare type OperationType = "request" | "running" | "ok" | "error";
export interface MatchActionInfo {
    isMatch: true;
    requestId: string;
    operation: OperationType;
}
export declare function parseActionType(actionType: string): MatchActionInfo | {
    isMatch: false;
};
export declare function formatActionType<TParams>(requestId: string, name: string, operation: OperationType, method: string, urlTemplate: string | ((params: TParams) => string) | ((params: TParams) => Promise<string>)): string;
