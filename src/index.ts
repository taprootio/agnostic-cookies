/*!
 * cookies
 * Copyright(c) 2014 Jed Schmidt, http://jed.is/
 * Copyright(c) 2015-2016 Douglas Christopher Wilson
 * MIT Licensed
 */

import Keygrip from "keygrip";
import { SetOptions } from "./set-options.js";
import { Cookie } from "./cookie.js";
import { IncomingMessage } from "http";

/**
 * Cache for generated name regular expressions.
 */
var REGEXP_CACHE = Object.create(null)

/**
 * RegExp to match all characters to escape in a RegExp.
 */
const REGEXP_ESCAPE_CHARS_REGEXP = /[\^$\\.*+?()[\]{}|]/g

/**
 * Get the pattern to search for a cookie in a string.
 * @param {string} name
 * @private
 */
function getPattern(name: string) {
    if (!REGEXP_CACHE[name]) {
        REGEXP_CACHE[name] = new RegExp(
            '(?:^|;) *' +
            name.replace(REGEXP_ESCAPE_CHARS_REGEXP, '\\$&') +
            '=([^;]*)'
        )
    }

    return REGEXP_CACHE[name]
}

type AgnosticCookiesOptions = {
    keys: string[],
}

type CookieValue<TValue> = {
    value: TValue | undefined;
}

const UndefinedResponse: CookieValue<any> = {
    value: undefined,
}

class AgnosticCookies {
    private keys: Keygrip;

    constructor(options: AgnosticCookiesOptions) {
        if (!options.keys || options.keys.length == 0) {
            throw new Error("Provide keys for signing cookies.");
        }

        this.keys = new Keygrip(options.keys);
    }

    private getCookieValue(request: IncomingMessage | Request, name: string): string | undefined {
        let header: string | undefined | null;

        if (request instanceof IncomingMessage) {
            header = request.headers["cookie"];
        } else {
            header = request.headers.get("Cookie");
        }

        if (!header) {
            return undefined;
        }

        const match = header.match(getPattern(name));

        if (!match) {
            return undefined;
        }

        let value = match[1];

        if (value[0] === '"') {
            value = value.slice(1, -1);
        }

        return value;
    }

    public get = <TValue>(request: IncomingMessage | Request, key: string): CookieValue<TValue> => {
        const signatureCookieName = `${key}.sig`;
        const signature = this.getCookieValue(request, signatureCookieName);

        if (!signature) {
            return UndefinedResponse;
        }

        const cookieValue = this.getCookieValue(request, key);

        if (!cookieValue) {
            return UndefinedResponse;
        }

        const data = `${key}=${cookieValue}`
        const keyIndex = this.keys.index(data, signature)

        //NOTE: If it's the latest key, index will be 0. Not found is -1.
        //      larger values are older keys that have been rotated up but
        //      still work.
        if (keyIndex < 0) {
            return {
                value: undefined,
            };
        }

        //TODO: If the expected return type is a primitive, just return it...
        const value = JSON.parse(Buffer.from(cookieValue, "base64").toString("ascii")) as TValue;

        return {
            value: value
        }
    }

    public build = <TValue>(key: string, value: TValue, options: SetOptions): Array<string> => {
        let stringValue = JSON.stringify(value);
        stringValue = Buffer.from(stringValue).toString("base64")

        const valueCookie = new Cookie(key, stringValue, options);
        const signingCookie = new Cookie(`${valueCookie.name}.sig`, this.keys.sign(valueCookie.toString()), options);

        return [
            valueCookie.toHeader(),
            signingCookie.toHeader(),
        ];
    }

    public expire = (key: string, options: SetOptions): Array<string> => {
        const signatureCookieName = `${key}.sig`;
        const expireValueCookie = new Cookie(key, null, {
            ...options,
            path: "/",
            expires: new Date("1982-01-07"),
        });
        const expireSigningCookie = new Cookie(signatureCookieName, null, {
            ...options,
            path: "/", expires: new Date("1982-01-07")
        });

        return [
            expireValueCookie.toHeader(),
            expireSigningCookie.toHeader(),
        ]
    }
}

export { AgnosticCookies, SetOptions }
