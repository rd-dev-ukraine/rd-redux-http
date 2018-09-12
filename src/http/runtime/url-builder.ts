import * as querystring from "querystring";
import { UrlTemplate } from "../api";

const paramRegex: RegExp = /:[A-Za-z]\w{1,}/g;

export function urlFromParams(
    urlTemplate: UrlTemplate<any>,
    appendRestToQueryString: boolean,
    params: any
): Promise<string> {
    return Promise.resolve(typeof urlTemplate === "function" ? urlTemplate(params) : urlTemplate).then(urlTemplate => {
        const p: any = { ...(params || {}) };

        const url = urlTemplate.replace(paramRegex, (match: string) => {
            match = match.replace(/[:()]/g, "");

            const value = encodeURIComponent(p[match] || "");
            delete p[match];

            return `${value}`;
        });

        if (appendRestToQueryString) {
            const qs = querystring.stringify(p).trim();

            if (qs) {
                return url.indexOf("?") === -1 ? `${url}?${qs}` : `${url}&${qs}`;
            }
        }

        return url;
    });
}
