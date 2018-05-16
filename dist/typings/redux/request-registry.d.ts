import { HttpRequest } from "../http";
export declare class RequestRegistry {
    private map;
    register(request: HttpRequest<any, any, any>, transform: (result: any) => any): void;
    take(requestId: string): {
        request: any;
        transform: any;
    };
}
