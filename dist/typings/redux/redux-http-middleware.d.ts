import { ReduxHttpMiddleware } from "./api";
/**
 * Factory for creating middlewares for rd-redux-http integration with redux.
 * One middleware per store is enough usually :)
 */
export declare function reduxHttpMiddlewareFactory(): ReduxHttpMiddleware;
