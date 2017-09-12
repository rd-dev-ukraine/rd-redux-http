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

        const action = createPost.request(
            { postId: 1 },
            post);

        action.should.be.eql({
            type: `RD-REDUX-HTTP [${createPost.id}] REQUEST PUT https://jsonplaceholder.typicode.com/posts/:postId`,
            params: { postId: 1 },
            body: post
        });

        createPost.isRequesting(action).should.be.true();
        createPost.actions.isMy(action).should.be.true();
        createPost.actions.isOk(action).should.be.false();
        createPost.actions.isError(action).should.be.false();
        createPost.actions.isErrorResponse(action).should.be.false();
        createPost.actions.isAuthorizationError(action).should.be.false();
        createPost.actions.isTransportError(action).should.be.false();
    });
});


interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
}
