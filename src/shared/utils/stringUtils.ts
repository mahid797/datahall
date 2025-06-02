/**
 * stringUtils.ts
 * ----------------------------------------------------------------------------
 * A collection of utility functions for string handling.
 * ----------------------------------------------------------------------------
 * USAGE EXAMPLES:
 *
 * 1) Splitting a full name:
 *    const splittedName = splitName("John Doe");
 *    // => e.g., {first_name: "John", last_name: "Doe"}
 *
 * 2) Converting transparency to hex:
 *    const transparencyHex = convertTransparencyToHex(0.78);
 *    // => e.g., "C7" (78% opacity)
 *
 * 3) Sorting fields based on a configuration:
 *    const sortedFields = sortFields(['email', 'name'], [{ key: 'name' }, { key: 'email' }]);
 *    // => e.g., ["name", "email"]
 */

// ----------------------------------------------------------------------------
// STRING UTILITIES
// ----------------------------------------------------------------------------

type SplitNameType = {
	first_name: string;
	last_name: string;
};

/**
 * splitName
 * ----------------------------------------------------------------------------
 * Splits a full name into a first name and last name.
 *
 * @param name The full name as a string (e.g., "John Doe").
 * @returns An object with `first_name` and `last_name` properties representing the first and last parts of the name.
 */
export function splitName(name: string): SplitNameType {
	if (!name || typeof name !== 'string') return { first_name: '', last_name: '' };

	const splitted = name.trim().split(' ');
	return {
		first_name: splitted[0] || '',
		last_name: splitted.slice(1).join(' ') || '',
	};
}

/**
 * convertTransparencyToHex
 * ----------------------------------------------------------------------------
 * Convert a transparency (alpha) number to hexadecimal (e.g., "c7").
 *
 * @param transparency A number between 0 and 1 representing the transparency level (e.g., 0.5 for 50% opacity).
 * @returns A two-digit hexadecimal string representing the transparency level (e.g., "c7" for 78% opacity)..
 */
export const convertTransparencyToHex = (transparency: number): string => {
	const alpha = Math.round(transparency * 255); // Convert transparency to a value between 0 and 255
	return alpha.toString(16).padStart(2, '0'); // Convert to 2-digit hex and pad with '0' if needed
};

/**
 * sortFields
 * ----------------------------------------------------------------------------
 * Sort an array of field keys based on the order defined in a configuration array.
 *
 * @param fields An array of field keys to be sorted (e.g., ['email', 'name']).
 * @param config An array of config objects with a `key` property used to define the desired order.
 * @returns A new array of field keys sorted according to the config array.
 */
export function sortFields(fields: string[], config: { key: string }[]): string[] {
	return [...fields].sort(
		(fieldA, fieldB) =>
			config.findIndex((item) => item.key === fieldA) -
			config.findIndex((item) => item.key === fieldB),
	);
}
