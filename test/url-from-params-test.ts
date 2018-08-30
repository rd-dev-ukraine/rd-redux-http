import "mocha";
import "should";
import { urlFromParams } from "../src/http/runtime/url-builder";

describe("URL from params", () => {
    it("should append query string correctly", () => {
        const result = urlFromParams("test/:paramId", true, { paramId: "abc", param2: "xyz" });

        result.should.be.equal("test/abc?param2=xyz");
    });

    it("should append query string correctly for param with underscore", () => {
        const result = urlFromParams("/campaigns/:clientId", true, { clientId: "C-123-12443", _q: 129290342343 });
        result.should.be.equal("/campaigns/C-123-12443?_q=129290342343");
    });
});
