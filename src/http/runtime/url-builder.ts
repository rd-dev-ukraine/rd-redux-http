import * as querystring from "querystring";


const paramRegex: RegExp = /:[A-Za-z]\w{1,}/g;


export function urlFromParams(urlTemplate: string, appendRestToQueryString: boolean, params: any): string {
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
}