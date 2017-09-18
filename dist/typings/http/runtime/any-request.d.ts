import { ActionTypeGuards, MakeRequestActionTypeGuards, MakeRequestWithBodyActionTypeGuards } from "../api";
/** Type guards for matching any rd-redux-http action. */
export declare const anyRequest: ActionTypeGuards<any, any, any> & MakeRequestActionTypeGuards<any> & MakeRequestWithBodyActionTypeGuards<any, any>;
