"use strict";
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
var paramRegex = /:[A-Za-z]\w{1,}/g;
function urlFromParams(urlTemplate, appendRestToQueryString, params) {
    var p = __assign({}, (params || {}));
    var url = urlTemplate.replace(this.paramRegex, function (match) {
        match = match.replace(/[:()]/g, "");
        var value = encodeURIComponent(p[match] || "");
        delete p[match];
        return "" + value;
    });
    if (appendRestToQueryString) {
        var qs = querystring.stringify(p).trim();
        if (qs) {
            return url.indexOf("?") === -1 ? url + "?" + qs : url + "&" + qs;
        }
    }
    return url;
}
exports.urlFromParams = urlFromParams;
//# sourceMappingURL=url-builder.js.map