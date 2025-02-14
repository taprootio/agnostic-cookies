interface SetOptions {
    /**
     * a number representing the milliseconds from Date.now() for expiry
     */
    maxAge?: number | undefined;
    /**
     * a Date object indicating the cookie's expiration
     * date (expires at the end of session by default).
     */
    expires?: Date | undefined;
    /**
     * a string indicating the path of the cookie (/ by default).
     */
    path?: string | undefined;
    /**
     * a string indicating the domain of the cookie (no default).
     */
    domain?: string | undefined;
    /**
     * a boolean indicating whether the cookie is only to be sent
     * over HTTPS (false by default for HTTP, true by default for HTTPS).
     */
    secure?: boolean | undefined;
    /**
     * "secureProxy" option is deprecated; use "secure" option, provide "secure" to constructor if needed
     */
    secureProxy?: boolean | undefined;
    /**
     * a boolean indicating whether the cookie is only to be sent over HTTP(S),
     * and not made available to client JavaScript (true by default).
     */
    httpOnly?: boolean | undefined;
    /**
     * a boolean or string indicating whether the cookie is a "same site" cookie (false by default).
     * This can be set to 'strict', 'lax', or true (which maps to 'strict').
     */
    sameSite?: "strict" | "lax" | "none" | boolean | undefined;
    /**
     * a boolean indicating whether to overwrite previously set
     * cookies of the same name (false by default). If this is true,
     * all cookies set during the same request with the same
     * name (regardless of path or domain) are filtered out of
     * the Set-Cookie header when setting this cookie.
     */
    overwrite?: boolean | undefined;
    /**
     * a string indicating the cookie priority.
     * This can be set to 'low', 'medium', or 'high'.
     */
    priority?: "low" | "medium" | "high" | undefined;
    /**
     * a boolean indicating whether to partition the cookie in Chrome
     * for the CHIPS Update (false by default). If this is true,
     * Cookies from embedded sites will be partitioned
     * and only readable from the same top level site from which it was created.
     */
    partitioned?: boolean | undefined;
}

export { SetOptions }
