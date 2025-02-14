import { SetOptions } from "./set-options";

/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */
const FIELD_CONTENT_REGEXP = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

/**
 * RegExp to match Priority cookie attribute value.
 */
const PRIORITY_REGEXP = /^(?:low|medium|high)$/i

/**
 * RegExp to match basic restricted name characters for loose validation.
 */
const RESTRICTED_NAME_CHARS_REGEXP = /[;=]/

/**
 * RegExp to match basic restricted value characters for loose validation.
 */
const RESTRICTED_VALUE_CHARS_REGEXP = /[;]/

/**
 * RegExp to match Same-Site cookie attribute value.
 */
const SAME_SITE_REGEXP = /^(?:lax|none|strict)$/i

class Cookie {
    constructor(public name: string, private value: string | null = "", public options: SetOptions = {}) {
        if (!FIELD_CONTENT_REGEXP.test(name) || RESTRICTED_NAME_CHARS_REGEXP.test(name)) {
            throw new TypeError('Argument name is invalid');
        }

        if (value && (!FIELD_CONTENT_REGEXP.test(value) || RESTRICTED_VALUE_CHARS_REGEXP.test(value))) {
            throw new TypeError('Argument value is invalid');
        }

        if (options.path && !FIELD_CONTENT_REGEXP.test(options.path)) {
            throw new TypeError('option path is invalid');
        }

        if (options.domain && !FIELD_CONTENT_REGEXP.test(options.domain)) {
            throw new TypeError('option domain is invalid');
        }

        if (options.priority && !PRIORITY_REGEXP.test(options.priority)) {
            throw new TypeError('option priority is invalid')
        }

        if (options.sameSite && options.sameSite !== true && !SAME_SITE_REGEXP.test(options.sameSite)) {
            throw new TypeError('option sameSite is invalid')
        }

        options.path = options.path ?? "/";
        options.httpOnly = options.httpOnly === undefined ? true : options.httpOnly;
        options.partitioned = options.partitioned === undefined ? false : options.partitioned;
        options.sameSite = options.sameSite === undefined ? false : options.sameSite;
        options.secure = options.secure === undefined ? false : options.secure;
        options.overwrite = options.overwrite === undefined ? false : options.overwrite;

        //NOTE: If no value is specified, it means expire
        //      the cookie.
        if (!this.value) {
            options.expires = new Date(0)
            options.maxAge = undefined
        }
    }

    public toString = (): string => {
        return this.name + "=" + this.value;
    }

    public toHeader = (): string => {
        let header = this.toString();

        if (this.options.maxAge) {
            this.options.expires = new Date(Date.now() + this.options.maxAge);
        }

        header += this.options.path ? "; path=" + this.options.path : "";
        header += this.options.expires ? "; expires=" + this.options.expires.toUTCString() : "";
        header += this.options.domain ? "; domain=" + this.options.domain : "";
        header += this.options.priority ? "; priority=" + this.options.priority.toLowerCase() : "";
        header += this.options.sameSite ? "; samesite=" + (this.options.sameSite === true ? 'strict' : this.options.sameSite.toLowerCase()) : "";
        header += this.options.secure ? "; secure" : "";
        header += this.options.httpOnly ? "; httponly" : "";
        header += this.options.partitioned ? "; partitioned" : "";

        return header;
    }
}

export { Cookie }
