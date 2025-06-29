// -----------------------------------------------------------------------------
// Utilities for coercing string values extracted from a `multipart/form-data`
// request into strongly-typed primitives. Centralizing these utilities helps
// avoid ad-hoc parsing logic scattered throughout API routes.
// -----------------------------------------------------------------------------

/**
 * Parses a string value (typically from a form input such as a checkbox)
 * into a boolean. Recognizes common truthy and falsy representations.
 *
 * Recognized as `true`: "true", "1", "on", "yes" (case-insensitive)
 * Recognized as `false`: "false", "0", "off", "no", "" (empty string)
 *
 * If the input is `undefined` or `null`, returns `undefined`.
 * Any unrecognized value defaults to `false`.
 *
 * @param raw - The raw string value to parse.
 * @returns `true` or `false` if parsed, or `undefined` if input is `undefined` or `null`.
 */
export function parseBoolean(raw?: string | null): boolean | undefined {
	if (raw === undefined || raw === null) return undefined;
	const val = raw.toString().trim().toLowerCase();
	if (['true', '1', 'on', 'yes'].includes(val)) return true;
	if (['false', '0', 'off', 'no', ''].includes(val)) return false;
	return false;
}

/**
 * Normalizes an optional text input so that an empty string is converted to `null`,
 * while `undefined` (field not present at all) is preserved. This allows you to
 * distinguish between "user cleared the field" (=> `null`) and "user did not touch
 * the field" (=> `undefined`) when building partial update payloads.
 *
 * @param raw - The raw string value to normalize.
 * @returns The trimmed string, `null` if the string is empty, or `undefined` if input is `undefined` or `null`.
 */
export function emptyToNull(raw?: string | null): string | null | undefined {
	if (raw === undefined || raw === null) return undefined;
	const trimmed = raw.trim();
	return trimmed === '' ? null : trimmed;
}
