/**
 * The function `sortFieldsByOrder` sorts an array of fields based on a specified order array while
 * preserving the original order of items not present in the order array.
 * @param {T[]} fields - The `fields` parameter is an array of strings representing the fields that
 * need to be sorted.
 * @param {T[]} order - The `order` parameter is an array that specifies the desired order in which the
 * elements in the `fields` array should be sorted.
 * @returns The `sortFieldsByOrder` function returns a new array of type `T[]` which contains the
 * elements from the `fields` array sorted based on the order specified in the `order` array. Items
 * that are not found in the `order` array will be placed at the end of the sorted array, while
 * maintaining their original order relative to each other.
 */
export const sortFieldsByOrder = <T extends string>(fields: T[], order: T[]): T[] => {
	return [...fields].sort((a, b) => {
		const indexA = order.indexOf(a);
		const indexB = order.indexOf(b);

		// Items not in `order` will go to the end, preserving original order among them
		return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
	});
};
