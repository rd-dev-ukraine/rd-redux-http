import "mocha";
import "should";
import { urlFromParams } from "../src/http/runtime/url-builder";

describe("URL from params", () => {
    it("should append query string correctly", done => {
        urlFromParams("test/:paramId", true, { paramId: "abc", param2: "xyz" })
            .then(url => url.should.be.equal("test/abc?param2=xyz"))
            .then(() => done(), done);
    });

    it("should append query string correctly for param with underscore", done => {
        urlFromParams("/campaigns/:clientId", true, { clientId: "C-123-12443", _q: 129290342343 })
            .then(url => {
                url.should.be.equal("/campaigns/C-123-12443?_q=129290342343");
            })
            .then(() => done(), err => done(err));
    });

    it("should work for function", done => {
        urlFromParams(() => "/campaigns/:clientId", true, { clientId: "C-123-12443", _q: 129290342343 })
            .then(url => {
                url.should.be.equal("/campaigns/C-123-12443?_q=129290342343");
            })
            .then(() => done(), err => done(err));
    });

    it("should work for function returning promise", done => {
        urlFromParams(
            () =>
                new Promise(resolve => {
                    setTimeout(() => resolve("/campaigns/:clientId"), 10);
                }),
            true,
            { clientId: "C-123-12443", _q: 129290342343 }
        )
            .then(url => {
                url.should.be.equal("/campaigns/C-123-12443?_q=129290342343");
            })
            .then(() => done(), err => done(err));
    });
});
