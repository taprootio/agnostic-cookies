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

interface CookieGetter {
    get: (name: string) => string | undefined;
}

class NodeCookieGetter implements CookieGetter {
    constructor(private request: IncomingMessage) { }

    get = (name: string): string | undefined => {
        const header = this.request.headers["cookie"]

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
}

export { CookieGetter, NodeCookieGetter }
