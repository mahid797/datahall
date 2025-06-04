// THIS IS NOT FUNCTIONAL YET, JUST A TEMPLATE

/**
 * A list of public route patterns, expressed as regex strings.
 */
export const PUBLIC_ROUTE_PATTERNS: readonly RegExp[] = [
	/^\/$/,
	/^\/auth\/sign-in$/,
	/^\/auth\/sign-up$/,
	/^\/auth\/forgot-password$/,
	/^\/auth\/reset-password(\/.*)?$/,
	/^\/api\/auth\/.*/,
	/^\/documentAccess\/[0-9a-fA-F-]{36}$/,
	/^\/_next\/.*/,
	/^\/favicon\.ico$/,
];

/**
 * Checks if a given pathname is public by testing against the regex patterns.
 *
 * @param pathname - the current route path (e.g. "/auth/sign-up" or "/documents/123").
 */
export function isPublicRoute(pathname: string): boolean {
	return PUBLIC_ROUTE_PATTERNS.some((rx) => rx.test(pathname));
}

/**
 * Builds a negative‑look‑ahead pattern for Next.js middleware.
 */
export const MIDDLEWARE_MATCHER_PATTERN: string = (() => {
	const parts = PUBLIC_ROUTE_PATTERNS.map((rx) => rx.source.replace('^\\/', '')).join('|');
	return `^/(?!(${parts})).*`;
})();
