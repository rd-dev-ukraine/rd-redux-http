import "mocha";
import "should";

import "isomorphic-fetch";

import { http } from "../src";
import { reduxHttpMiddlewareFactory } from "../src/redux";

describe("Redux integration", () => {
    it("should be fluent", () => {
        const mw = reduxHttpMiddlewareFactory();


        const createPost = mw.register(
            http
                .put<{ postId: number }>("https://jsonplaceholder.typicode.com/posts/:postId")
                .jsonBody<Post>()
                .resultFromJson<Post>()
                .build()
        );

        const post: Post = {
            id: 1,
            userId: 1,
            title: "title",
            body: "body"
        };

        const action = createPost.run(
            { postId: 1 },
            post);

        action.should.be.eql({
            type: "RD-REDUX-HTTP [1] run PUT https://jsonplaceholder.typicode.com/posts/:postId",
            params: { postId: 1 },
            body: post
        });

        createPost.isRunning(action).should.be.true();
        createPost.isMy(action).should.be.true();
        createPost.isOk(action).should.be.false();
        createPost.isError(action).should.be.false();
        createPost.isErrorResponse(action).should.be.false();
        createPost.isAuthorizationError(action).should.be.false();
        createPost.isTransportError(action).should.be.false();
    });
});


interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
}
