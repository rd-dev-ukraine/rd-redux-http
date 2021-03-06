"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var querystring = require("querystring");
var runtime_1 = require("../runtime");
var EntryPoint = /** @class */ (function () {
    function EntryPoint() {
    }
    EntryPoint.prototype.fetch = function (method, urlTemplate, appendRestOfParamsToQueryString, name) {
        if (appendRestOfParamsToQueryString === void 0) { appendRestOfParamsToQueryString = false; }
        if (name === void 0) { name = ""; }
        if (!method) {
            throw new Error("HTTP verb is not defined.");
        }
        if (!urlTemplate) {
            throw new Error("URL template is not defined.");
        }
        var config = {
            method: method,
            name: name,
            urlTemplate: urlTemplate,
            appendRestOfParamsToQueryString: appendRestOfParamsToQueryString,
            convertResult: undefined,
            fetch: undefined,
            pre: [],
            post: [],
            processResponse: undefined
        };
        return new RequestConfigurator(config);
    };
    EntryPoint.prototype.get = function (urlTemplate, appendRestOfParamsToQueryString, name) {
        if (appendRestOfParamsToQueryString === void 0) { appendRestOfParamsToQueryString = false; }
        if (name === void 0) { name = ""; }
        return this.fetch("GET", urlTemplate, appendRestOfParamsToQueryString, name);
    };
    EntryPoint.prototype.post = function (urlTemplate, appendRestOfParamsToQueryString, name) {
        if (appendRestOfParamsToQueryString === void 0) { appendRestOfParamsToQueryString = false; }
        if (name === void 0) { name = ""; }
        return this.fetch("POST", urlTemplate, appendRestOfParamsToQueryString, name);
    };
    EntryPoint.prototype.put = function (urlTemplate, appendRestOfParamsToQueryString, name) {
        if (appendRestOfParamsToQueryString === void 0) { appendRestOfParamsToQueryString = false; }
        if (name === void 0) { name = ""; }
        return this.fetch("PUT", urlTemplate, appendRestOfParamsToQueryString, name);
    };
    EntryPoint.prototype.patch = function (urlTemplate, appendRestOfParamsToQueryString, name) {
        if (appendRestOfParamsToQueryString === void 0) { appendRestOfParamsToQueryString = false; }
        if (name === void 0) { name = ""; }
        return this.fetch("PATCH", urlTemplate, appendRestOfParamsToQueryString, name);
    };
    EntryPoint.prototype.delete = function (urlTemplate, appendRestOfParamsToQueryString, name) {
        if (appendRestOfParamsToQueryString === void 0) { appendRestOfParamsToQueryString = false; }
        if (name === void 0) { name = ""; }
        return this.fetch("DELETE", urlTemplate, appendRestOfParamsToQueryString, name);
    };
    return EntryPoint;
}());
var RequestConfigurator = /** @class */ (function () {
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
    };
    RequestConfigurator.prototype.pre = function (prepareRequest) {
        if (!prepareRequest) {
            throw new Error("Prepare request function is not defined.");
        }
        this.config.pre.push(prepareRequest);
        return this;
    };
    RequestConfigurator.prototype.prepareParams = function (paramsConverter) {
        if (!paramsConverter) {
            throw new Error("Params converter is not defined");
        }
        this.config.prepareParams = paramsConverter;
        return this;
    };
    RequestConfigurator.prototype.withFetch = function (customFetch) {
        if (!customFetch) {
            throw new Error("Custom fetch function is not defined.");
        }
        this.config.fetch = customFetch;
        return this;
    };
    RequestConfigurator.prototype.processResponse = function (processor) {
        if (!processor) {
            throw new Error("Processor function is not defined.");
        }
        this.config.processResponse = processor;
        return new RequestBuilder(this.config);
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
var RequestWithBodyConfigurator = /** @class */ (function () {
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
    RequestWithBodyConfigurator.prototype.processResponse = function (processor) {
        if (!processor) {
            throw new Error("Processor function is not defined.");
        }
        this.config.processResponse = processor;
        return new RequestWithBodyBuilder(this.config);
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
var RequestBuilder = /** @class */ (function () {
    function RequestBuilder(config) {
        this.config = config;
        if (!config) {
            throw new Error("Configuration object is missing.");
        }
    }
    /**
     * Changes parsed and processed result (success or error) of HTTP request.
     */
    RequestBuilder.prototype.post = function (process) {
        if (!process) {
            throw new Error("Process function is expected but not defined.");
        }
        this.config.post.push(process);
        return new RequestBuilder(this.config);
    };
    RequestBuilder.prototype.build = function () {
        return runtime_1.createHttpRequest(this.config);
    };
    return RequestBuilder;
}());
var RequestWithBodyBuilder = /** @class */ (function () {
    function RequestWithBodyBuilder(config) {
        this.config = config;
        if (!config) {
            throw new Error("Configuration object is missing.");
        }
    }
    /**
     * Changes parsed and processed result (success or error) of HTTP request.
     */
    RequestWithBodyBuilder.prototype.post = function (process) {
        if (!process) {
            throw new Error("Process function is expected but not defined.");
        }
        this.config.post.push(process);
        return new RequestWithBodyBuilder(this.config);
    };
    RequestWithBodyBuilder.prototype.build = function () {
        return runtime_1.createHttpRequest(this.config);
    };
    return RequestWithBodyBuilder;
}());
/**
 * Start configuring HTTP request from here.
 */
exports.http = new EntryPoint();
//# sourceMappingURL=http-request-builder.js.map