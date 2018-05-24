export const FETCH_STATE_INITIAL = "initial";
export type FETCH_STATE_INITIAL = "initial";

export const FETCH_STATE_LOADING = "loading";
export type FETCH_STATE_LOADING = "loading";

export const FETCH_STATE_SUCCESS = "success";
export type FETCH_STATE_SUCCESS = "success";

export const FETCH_STATE_ERROR = "error";
export type FETCH_STATE_ERROR = "error";

export type FETCH_STATE = FETCH_STATE_INITIAL | FETCH_STATE_LOADING | FETCH_STATE_SUCCESS | FETCH_STATE_ERROR;

export interface CalculateCommonStateOptions {
    /** If true common state would be loading if at least one state is loading and one is error. */
    waitForLoadingOnError: boolean;
}

/**
 * Calculates common state from a set of states.
 */
export function calculateCommonState(state: FETCH_STATE[], options?: CalculateCommonStateOptions): FETCH_STATE {
    options = options || {
        waitForLoadingOnError: false
    };

    if (!state.length) {
        throw new Error("States are empty");
    }

    const unique = new Set<FETCH_STATE>(state);

    if (unique.has(FETCH_STATE_LOADING)) {
        return unique.has(FETCH_STATE_ERROR)
            ? options.waitForLoadingOnError
                ? FETCH_STATE_LOADING
                : FETCH_STATE_ERROR
            : FETCH_STATE_LOADING;
    }

    if (unique.has(FETCH_STATE_ERROR)) {
        return FETCH_STATE_ERROR;
    }

    if (unique.has(FETCH_STATE_INITIAL)) {
        return FETCH_STATE_INITIAL;
    }

    return FETCH_STATE_SUCCESS;
}
