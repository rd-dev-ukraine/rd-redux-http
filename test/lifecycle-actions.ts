import "mocha";
import "should";

import { http } from "../src";


describe("Lifecycle actions", () => {

    const getPostById = http.get<{ postId: number }>("https://jsonplaceholder.typicode.com/posts/:postId")
        .resultFromJson<Post>()
        .build();

    const getPostById2 = http.get<{ postId: number }>("https://jsonplaceholder.typicode.com/posts/:postId")
        .resultFromJson<Post>()
        .build();

    describe("isMy action", () => {
        it("should be correct for running", () => {

            getPostById.lifecycleActions.isMy(
                getPostById.lifecycleActions.running({ postId: 1 })
            ).should.be.true();

            getPostById.lifecycleActions.isMy(
                getPostById2.lifecycleActions.running({ postId: 1 })
            ).should.be.false();

            getPostById2.lifecycleActions.isMy(
                getPostById.lifecycleActions.running({ postId: 1 })
            ).should.be.false();
        });

        it("should be correct for ok", () => {

            getPostById.lifecycleActions.isMy(
                getPostById.lifecycleActions.ok({ postId: 1 }, post)
            ).should.be.true();

            getPostById.lifecycleActions.isMy(
                getPostById2.lifecycleActions.ok({ postId: 1 }, post)
            ).should.be.false();

            getPostById2.lifecycleActions.isMy(
                getPostById.lifecycleActions.ok({ postId: 1 }, post)
            ).should.be.false();
        });

        it("should be correct for error", () => {

            getPostById.lifecycleActions.isMy(
                getPostById.lifecycleActions.error({ postId: 1 }, "Error")
            ).should.be.true();

            getPostById.lifecycleActions.isMy(
                getPostById2.lifecycleActions.error({ postId: 1 }, "Error")
            ).should.be.false();

            getPostById2.lifecycleActions.isMy(
                getPostById.lifecycleActions.error({ postId: 1 }, "error")
            ).should.be.false();
        });
    });

    describe("isRunning", () => {

        it("should be true for own running action", () => {
            getPostById.lifecycleActions.isRunning(
                getPostById.lifecycleActions.running({ postId: 1 })
            ).should.be.true();
        });

        it("should be false for foreign running action", () => {
            getPostById.lifecycleActions.isRunning(
                getPostById2.lifecycleActions.running({ postId: 1 })
            ).should.be.false();
        });

        it("should be false for own other action", () => {
            getPostById.lifecycleActions.isRunning(
                getPostById.lifecycleActions.ok({ postId: 1 }, post)
            ).should.be.false();

            getPostById.lifecycleActions.isRunning(
                getPostById.lifecycleActions.error({ postId: 1 }, "Error")
            ).should.be.false();
        });
    });

});

const post: Post = {
    userId: 1,
    id: 1,
    title: "Title",
    body: "Body"
};

interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
}
