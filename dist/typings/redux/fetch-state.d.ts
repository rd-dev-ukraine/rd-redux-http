export declare const FETCH_STATE_INITIAL = "initial";
export declare type FETCH_STATE_INITIAL = "initial";
export declare const FETCH_STATE_LOADING = "loading";
export declare type FETCH_STATE_LOADING = "loading";
export declare const FETCH_STATE_SUCCESS = "success";
export declare type FETCH_STATE_SUCCESS = "success";
export declare const FETCH_STATE_ERROR = "error";
export declare type FETCH_STATE_ERROR = "error";
export declare type FETCH_STATE = FETCH_STATE_INITIAL | FETCH_STATE_LOADING | FETCH_STATE_SUCCESS | FETCH_STATE_ERROR;
export interface CalculateCommonStateOptions {
    /** If true common state would be loading if at least one state is loading and one is error. */
    waitForLoadingOnError: boolean;
}
/**
 * Calculates common state from a set of states.
 */
export declare function calculateCommonState(state: FETCH_STATE[], options?: CalculateCommonStateOptions): FETCH_STATE;
