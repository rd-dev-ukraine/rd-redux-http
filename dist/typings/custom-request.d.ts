import { ReduxHttpCommonTypeGuard } from "./action-helpers";
import { ReduxHttpCustomRequestFactory, ReduxHttpCustomRequestResultConfig } from "./api";
export declare class CustomRequestBuilder extends ReduxHttpCommonTypeGuard {
    define<TParams, TResult, TError>(asyncWorker: (params: TParams) => Promise<TResult>): ReduxHttpCustomRequestFactory<TParams> & ReduxHttpCustomRequestResultConfig<TParams, TResult, TError>;
}
export declare const async: CustomRequestBuilder;
