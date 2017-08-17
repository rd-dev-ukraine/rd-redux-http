import { HttpRequest } from "../http";
export declare class RequestRegistry {
    private map;
    private lastRequestId;
    register(request: HttpRequest<any, any, any>): string;
    take(requestId: string): any;
}
