"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var querystring = require("querystring");
var action_helpers_1 = require("./action-helpers");
var fetch_core_1 = require("./fetch.core");
var FetchRequestConfigurationEntryImpl = (function (_super) {
    __extends(FetchRequestConfigurationEntryImpl, _super);
    function FetchRequestConfigurationEntryImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FetchRequestConfigurationEntryImpl.prototype.fetch = function (method, url) {
        if (!method) {
            throw new Error("Method is not defined.");
        }
        if (!url) {
            throw new Error("URL is not defined.");
        }
        return new FetchBuilderWithParams(new FetchBuilderCore({
            method: method,
            url: url
        }));
    };
    FetchRequestConfigurationEntryImpl.prototype.get = function (url) {
        return this.fetch("get", url);
    };
    FetchRequestConfigurationEntryImpl.prototype.post = function (url) {
        return this.fetch("post", url);
    };
    FetchRequestConfigurationEntryImpl.prototype.put = function (url) {
        return this.fetch("put", url);
    };
    FetchRequestConfigurationEntryImpl.prototype.delete = function (url) {
        return this.fetch("delete", url);
    };
    return FetchRequestConfigurationEntryImpl;
}(action_helpers_1.ReduxHttpFetchTypeGuard));
var FetchBuilderCore = (function () {
    function FetchBuilderCore(configuration) {
        this.configuration = configuration;
        this.paramRegex = /:[A-Za-z]\w{1,}/g;
        if (!configuration) {
            throw new Error("Configuration is not provided.");
        }
        this.configuration.pre = [this.urlFromParamsPre.bind(this)];
    }
    FetchBuilderCore.prototype.pre = function (middleware) {
        if (!middleware) {
            throw new Error("Middleware is not defined.");
        }
        if (!this.configuration.pre) {
            this.configuration.pre = [];
        }
        this.configuration.pre.push(middleware);
    };
    FetchBuilderCore.prototype.restOfParamsToQueryString = function () {
        this.pre(this.appendQueryStringFromRestParamsPre.bind(this));
    };
    FetchBuilderCore.prototype.jsonBody = function () {
        this.pre(function (request, params, body) {
            request.headers = request.headers || {};
            request.headers["Content-Type"] = "application/json";
            if (body) {
                request.body = JSON.stringify(body);
            }
            return request;
        });
    };
    FetchBuilderCore.prototype.formsBody = function () {
        this.pre(function (request, params, body) {
            request.headers = request.headers || {};
            request.headers["Content-Type"] = "application/x-form-urlencoded";
            if (body) {
                request.body = querystring.stringify(body);
            }
            return request;
        });
    };
    FetchBuilderCore.prototype.withFetch = function (fetch) {
        if (!fetch) {
            throw new Error("Custom fetch is not defined.");
        }
        this.configuration.fetch = fetch;
    };
    FetchBuilderCore.prototype.getConfiguration = function () {
        return this.configuration;
    };
    FetchBuilderCore.prototype.urlFromParamsPre = function (request, params, body) {
        if (!this.configuration || !this.configuration.url) {
            return __assign({}, request);
        }
        var p = __assign({}, (params || {}));
        var url = this.configuration.url.replace(this.paramRegex, function (match) {
            match = match.replace(/[:()]/g, "");
            var value = p[match] || "";
            delete p[match];
            return "" + value;
        });
        return __assign({}, request, { url: url });
    };
    FetchBuilderCore.prototype.appendQueryStringFromRestParamsPre = function (request, params) {
        if (this.configuration && this.configuration.url) {
            var p_1 = __assign({}, (params || {}));
            this.configuration.url.replace(this.paramRegex, function (match) {
                match = match.replace(/[:()]/g, "");
                var value = p_1[match] || "";
                delete p_1[match];
                return "" + value;
            });
            var queryString = querystring.stringify(p_1);
            if (queryString.trim()) {
                return __assign({}, request, { url: request.url + "?" + queryString });
            }
        }
        return __assign({}, request);
    };
    return FetchBuilderCore;
}());
var FetchBuilderWithParams = (function () {
    function FetchBuilderWithParams(core) {
        this.core = core;
        if (!core) {
            throw new Error("Core is not provided.");
        }
    }
    FetchBuilderWithParams.prototype.restParamsToQueryString = function () {
        this.core.restOfParamsToQueryString();
        return this;
    };
    FetchBuilderWithParams.prototype.jsonBody = function () {
        this.core.jsonBody();
        return new FetchBuilderWithBody(this.core);
    };
    FetchBuilderWithParams.prototype.formsBody = function () {
        this.core.formsBody();
        return new FetchBuilderWithBody(this.core);
    };
    FetchBuilderWithParams.prototype.pre = function (middleware) {
        if (!middleware) {
            throw new Error("Middleware is not defined.");
        }
        this.core.pre(middleware);
        return this;
    };
    FetchBuilderWithParams.prototype.useFetch = function (fetch) {
        this.core.withFetch(fetch);
        return this;
    };
    FetchBuilderWithParams.prototype.resultAsJson = function () {
        return this.createBuilder();
    };
    FetchBuilderWithParams.prototype.createBuilder = function () {
        var configuration = this.core.getConfiguration();
        return new (function () {
            function class_1() {
            }
            class_1.prototype.build = function () {
                return new fetch_core_1.ReduxHttpFetchRequestWithParams(configuration);
            };
            return class_1;
        }());
    };
    return FetchBuilderWithParams;
}());
var FetchBuilderWithBody = (function () {
    function FetchBuilderWithBody(core) {
        this.core = core;
        if (!core) {
            throw new Error("Core is not provided.");
        }
    }
    FetchBuilderWithBody.prototype.pre = function (middleware) {
        if (!middleware) {
            throw new Error("Middleware is not defined.");
        }
        this.core.pre(middleware);
        return this;
    };
    FetchBuilderWithBody.prototype.useFetch = function (fetch) {
        if (!fetch) {
            throw new Error("");
        }
        this.core.withFetch(fetch);
        return this;
    };
    FetchBuilderWithBody.prototype.resultAsJson = function () {
        return this.createBuilder();
    };
    FetchBuilderWithBody.prototype.createBuilder = function () {
        var configuration = this.core.getConfiguration();
        return new (function () {
            function class_2() {
            }
            class_2.prototype.build = function () {
                return new fetch_core_1.ReduxHttpFetchRequestWithBody(configuration);
            };
            return class_2;
        }());
    };
    return FetchBuilderWithBody;
}());
exports.http = new FetchRequestConfigurationEntryImpl();
//# sourceMappingURL=fetch.builder.js.map