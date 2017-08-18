"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var querystring = require("querystring");
var runtime_1 = require("../runtime");
var EntryPoint = (function () {
    function EntryPoint() {
    }
    EntryPoint.prototype.fetch = function (method, urlTemplate, appendRestOfParamsToQueryString) {
        if (appendRestOfParamsToQueryString === void 0) { appendRestOfParamsToQueryString = false; }
        if (!method) {
            throw new Error("HTTP verb is not defined.");
        }
        if (!urlTemplate) {
            throw new Error("URL template is not defined.");
        }
        var config = {
            method: method,
            urlTemplate: urlTemplate,
            appendRestOfParamsToQueryString: appendRestOfParamsToQueryString,
            convertResult: undefined,
            fetch: undefined,
            pre: [],
            processResponse: undefined
        };
        return new RequestConfigurator(config);
    };
    EntryPoint.prototype.get = function (urlTemplate, appendRestOfParamsToQueryString) {
        if (appendRestOfParamsToQueryString === void 0) { appendRestOfParamsToQueryString = false; }
        return this.fetch("GET", urlTemplate, appendRestOfParamsToQueryString);
    };
    EntryPoint.prototype.post = function (urlTemplate, appendRestOfParamsToQueryString) {
        if (appendRestOfParamsToQueryString === void 0) { appendRestOfParamsToQueryString = false; }
        return this.fetch("POST", urlTemplate, appendRestOfParamsToQueryString);
    };
    EntryPoint.prototype.put = function (urlTemplate, appendRestOfParamsToQueryString) {
        if (appendRestOfParamsToQueryString === void 0) { appendRestOfParamsToQueryString = false; }
        return this.fetch("PUT", urlTemplate, appendRestOfParamsToQueryString);
    };
    EntryPoint.prototype.patch = function (urlTemplate, appendRestOfParamsToQueryString) {
        if (appendRestOfParamsToQueryString === void 0) { appendRestOfParamsToQueryString = false; }
        return this.fetch("PATCH", urlTemplate, appendRestOfParamsToQueryString);
    };
    EntryPoint.prototype.delete = function (urlTemplate, appendRestOfParamsToQueryString) {
        if (appendRestOfParamsToQueryString === void 0) { appendRestOfParamsToQueryString = false; }
        return this.fetch("DELETE", urlTemplate, appendRestOfParamsToQueryString);
    };
    return EntryPoint;
}());
var RequestConfigurator = (function () {
    function RequestConfigurator(config) {
        this.config = config;
        if (!config) {
            throw new Error("Configuration object is missing.");
        }
    }
    RequestConfigurator.prototype.jsonBody = function () {
        var configurator = new RequestWithBodyConfigurator(this.config);
        return configurator.pre(function (request, params, body) {
            var requestInit = {
                headers: {
                    "Content-Type": "application/json"
                },
                body: body ? JSON.stringify(body) : undefined
            };
            return new Request(request, requestInit);
        });
    };
    RequestConfigurator.prototype.formsBody = function () {
        var configurator = new RequestWithBodyConfigurator(this.config);
        return configurator.pre(function (request, params, body) {
            var requestInit = {
                headers: {
                    "Content-Type": "application/x-form-urlencoded"
                },
                body: body ? querystring.stringify(body) : undefined
            };
            return new Request(request, requestInit);
        });
    };
    RequestConfigurator.prototype.customBody = function () {
        return new RequestWithBodyConfigurator(this.config);
        ;
    };
    RequestConfigurator.prototype.pre = function (prepareRequest) {
        if (!prepareRequest) {
            throw new Error("Prepare request function is not defined.");
        }
        this.config.pre.push(prepareRequest);
        return this;
    };
    RequestConfigurator.prototype.withFetch = function (customFetch) {
        if (!customFetch) {
            throw new Error("Custom fetch function is not defined.");
        }
        this.config.fetch = customFetch;
        return this;
    };
    RequestConfigurator.prototype.resultFromJson = function () {
        return new RequestBuilder(this.config);
    };
    RequestConfigurator.prototype.convertResult = function (converter) {
        if (!converter) {
            throw new Error("Coversion function is not defined.");
        }
        this.config.convertResult = converter;
        return new RequestBuilder(this.config);
    };
    return RequestConfigurator;
}());
var RequestWithBodyConfigurator = (function () {
    function RequestWithBodyConfigurator(config) {
        this.config = config;
        if (!config) {
            throw new Error("Configuration object is missing.");
        }
    }
    RequestWithBodyConfigurator.prototype.pre = function (prepareRequest) {
        if (!prepareRequest) {
            throw new Error("Prepare request function is not defined.");
        }
        this.config.pre.push(prepareRequest);
        return this;
    };
    RequestWithBodyConfigurator.prototype.withFetch = function (customFetch) {
        if (!customFetch) {
            throw new Error("Custom fetch function is not defined.");
        }
        this.config.fetch = customFetch;
        return this;
    };
    RequestWithBodyConfigurator.prototype.resultFromJson = function () {
        return new RequestWithBodyBuilder(this.config);
    };
    RequestWithBodyConfigurator.prototype.convertResult = function (converter) {
        if (!converter) {
            throw new Error("Coversion function is not defined.");
        }
        this.config.convertResult = converter;
        return new RequestWithBodyBuilder(this.config);
    };
    return RequestWithBodyConfigurator;
}());
var RequestBuilder = (function () {
    function RequestBuilder(config) {
        this.config = config;
        if (!config) {
            throw new Error("Configuration object is missing.");
        }
    }
    RequestBuilder.prototype.build = function () {
        return runtime_1.createHttpRequest(this.config);
    };
    return RequestBuilder;
}());
var RequestWithBodyBuilder = (function () {
    function RequestWithBodyBuilder(config) {
        this.config = config;
        if (!config) {
            throw new Error("Configuration object is missing.");
        }
    }
    RequestWithBodyBuilder.prototype.build = function () {
        return runtime_1.createHttpRequest(this.config);
    };
    return RequestWithBodyBuilder;
}());
exports.http = new EntryPoint();
//# sourceMappingURL=http-request-builder.js.map