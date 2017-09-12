import { HttpRequest } from "../http";
export declare class RequestRegistry {
    private map;
    register(request: HttpRequest<any, any, any>): void;
    take(requestId: string): any;
}
