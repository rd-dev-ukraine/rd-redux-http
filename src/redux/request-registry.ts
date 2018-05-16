import { HttpRequest } from "../http";

export class RequestRegistry {
    private map: any = {};

    register(request: HttpRequest<any, any, any>, transform: (result: any) => any): void {
        if (!request) {
            throw new Error("Http Request object is not defined.");
        }


        this.map[request.id] = { request, transform };
    }

    take(requestId: string): { request: any; transform: any } {
        if (!requestId) {
            throw new Error("Request ID is not deinfed.");
        }

        return this.map[requestId];
    }


}