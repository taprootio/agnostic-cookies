/*!
 * cookies
 * Copyright(c) 2014 Jed Schmidt, http://jed.is/
 * Copyright(c) 2015-2016 Douglas Christopher Wilson
 * MIT Licensed
 */

import Keygrip from "keygrip";
import { CookieGetter } from "./cookie-getter";
import { CookieSetter, SetOptions } from "./cookie-setter";
import { Cookie } from "./cookie";

type AgnosticCookiesOptions = {
    keys: string[],
}

class AgnosticCookies {
    private keys: Keygrip;

    constructor(
        private cookieGetter: CookieGetter,
        private cookieSetter: CookieSetter,
        options: AgnosticCookiesOptions) {
        if (!options.keys || options.keys.length == 0) {
            throw new Error("Provide keys for signing cookies.");
        }

        this.keys = new Keygrip(options.keys);
    }

    public get = <TValue>(key: string): TValue | undefined => {
        const signatureCookieName = `${key}.sig`;
        const signature = this.cookieGetter.get(signatureCookieName);

        if (!signature) {
            return undefined;
        }

        const cookieValue = this.cookieGetter.get(key);

        if (!cookieValue) {
            return undefined;
        }

        const data = `${key}=${cookieValue}`
        const keyIndex = this.keys.index(data, signature)

        if (keyIndex < 0) {
            this.cookieSetter.set(new Cookie(signatureCookieName, null, { path: "/", signed: false }));
            return undefined;
        }

        keyIndex && this.cookieSetter.set(new Cookie(signatureCookieName, this.keys.sign(data), { signed: false }));

        //TODO: If the expected return type is a primitive, just return it...
        return JSON.parse(Buffer.from(cookieValue, "base64").toString("ascii")) as TValue;
    }

    public set = <TValue>(key: string, value: TValue, options: SetOptions) => {
        let stringValue = JSON.stringify(value);
        stringValue = Buffer.from(stringValue).toString("base64")

        const valueCookie = new Cookie(key, stringValue, options);
        this.cookieSetter.set(valueCookie);

        const signingCookie = new Cookie(`${valueCookie.name}.sig`, this.keys.sign(valueCookie.toString()), options);
        this.cookieSetter.set(signingCookie);
    }
}

export { AgnosticCookies }
