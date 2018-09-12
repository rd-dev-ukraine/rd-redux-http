import "mocha";
import "should";

import "isomorphic-fetch";

import { http, OkResult } from "../src";

describe("http", () => {
    it("GET with params should work", () => {
        const getPostById = http
            .get<{ postId: number }>(() => Promise.resolve("https://jsonplaceholder.typicode.com/posts/:postId"))
            .resultFromJson<Post>()
            .build();

        return getPostById({ postId: 1 }).should.be.fulfilledWith(<OkResult<Post>>{
            ok: true,
            result: {
                id: 1,
                userId: 1,
                title: "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
                body:
                    "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
            }
        });
    });

    it("POST with body should work", () => {
        const createPost = http
            .put<{ postId: number }>("https://jsonplaceholder.typicode.com/posts/:postId")
            .jsonBody<Post>()
            .resultFromJson<Post>()
            .build();

        return createPost(
            { postId: 1 },
            {
                id: 1,
                title: "test",
                body: "body",
                userId: 1
            }
        ).should.be.finally.eql({
            ok: true,
            result: {
                id: 1,
                title: "test",
                body: "body",
                userId: 1
            }
        });
    });

    it("POST to non-existing address should produce TransportErrorResult", () => {
        const createPost = http
            .put<{ postId: number }>("https://jsonplaceholder.typicode.com/posts/:postId")
            .jsonBody<Post>()
            .resultFromJson<Post>()
            .build();

        return createPost(
            { postId: -1 },
            {
                id: 1,
                title: "",
                body: "",
                userId: -1
            }
        ).should.finally.match((actual: any) => {
            const expected = {
                error: "Not Found",
                ok: false,
                reason: "other",
                statusCode: 404,
                errorType: "transport"
            };

            return actual.should.eql(expected);
        });
    });
});

interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
}
