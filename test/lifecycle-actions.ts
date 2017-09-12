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

            getPostById.actions.isMy(
                getPostById.actions.running({ postId: 1 })
            ).should.be.true();

            getPostById.actions.isMy(
                getPostById2.actions.running({ postId: 1 })
            ).should.be.false();

            getPostById2.actions.isMy(
                getPostById.actions.running({ postId: 1 })
            ).should.be.false();
        });

        it("should be correct for ok", () => {

            getPostById.actions.isMy(
                getPostById.actions.ok({ postId: 1 }, { ok: true, result: post })
            ).should.be.true();

            getPostById.actions.isMy(
                getPostById2.actions.ok({ postId: 1 }, { ok: true, result: post })
            ).should.be.false();

            getPostById2.actions.isMy(
                getPostById.actions.ok({ postId: 1 }, { ok: true, result: post })
            ).should.be.false();
        });

        it("should be correct for error", () => {

            getPostById.actions.isMy(
                getPostById.actions.error({ postId: 1 }, { ok: false, errorType: "response", error: "Error" })
            ).should.be.true();

            getPostById.actions.isMy(
                getPostById2.actions.error({ postId: 1 }, { ok: false, errorType: "response", error: "Error" })
            ).should.be.false();

            getPostById2.actions.isMy(
                getPostById.actions.error({ postId: 1 }, { ok: false, errorType: "response", error: "Error" })
            ).should.be.false();
        });
    });

    describe("isRunning", () => {

        it("should be true for own running action", () => {
            getPostById.actions.isRunning(
                getPostById.actions.running({ postId: 1 })
            ).should.be.true();
        });

        it("should be false for foreign running action", () => {
            getPostById.actions.isRunning(
                getPostById2.actions.running({ postId: 1 })
            ).should.be.false();
        });

        it("should be false for own other action", () => {
            getPostById.actions.isRunning(
                getPostById.actions.ok({ postId: 1 }, { ok: true, result: post })
            ).should.be.false();

            getPostById.actions.isRunning(
                getPostById.actions.error({ postId: 1 }, { ok: false, errorType: "response", error: "Error" })
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
