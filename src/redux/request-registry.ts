import { HttpRequest } from "../http";

export class RequestRegistry {
    private map: any = {};
    private lastRequestId = 0;

    register(request: HttpRequest<any, any, any>): string {
        if (!request) {
            throw new Error("Http Request object is not defined.");
        }

        this.lastRequestId++;

        this.map[this.lastRequestId] = request;

        return `${this.lastRequestId}`;
    }

    take(requestId: string): any {
        if (!requestId) {
            throw new Error("Request ID is not deinfed.");
        }

        return this.map[requestId];
    }


}