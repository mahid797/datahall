import { useState, useMemo, useCallback } from 'react';

type SortFunction<T> = (a: T, b: T, orderDirection: 'asc' | 'desc' | undefined) => number;

/**
 * Lightweight, generic array sorter hook.
 */
export function useSort<T>(
	data: T[],
	initialKey: keyof T | undefined = undefined,
	customSort?: SortFunction<T>,
) {
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | undefined>(undefined);
	const [sortBy, setSortBy] = useState<keyof T | undefined>(initialKey);

	// Memoised comparator function.
	const comparator = useCallback(
		(a: T, b: T) => {
			if (!sortDirection || !sortBy) return 0;

			// 1) If a custom sort function is provided, use it.
			if (customSort) {
				return customSort(a, b, sortDirection);
			}

			let aValue: any = a[sortBy];
			let bValue: any = b[sortBy];

			// 2) If both values are Date objects, compare by getTime().
			if (aValue instanceof Date && bValue instanceof Date) {
				return sortDirection === 'asc'
					? aValue.getTime() - bValue.getTime()
					: bValue.getTime() - aValue.getTime();
			}

			// 3) Handle nested objects with a `.name` property, or strings.
			const normalise = (value: any) =>
				typeof value === 'object' && value
					? (value.name?.toUpperCase() ?? '')
					: typeof value === 'string'
						? value.toUpperCase()
						: value;

			aValue = normalise(aValue);
			bValue = normalise(bValue);

			// 4) Default string/number comparison.
			if (sortDirection === 'asc') {
				return aValue < bValue ? -1 : 1;
			} else if (sortDirection === 'desc') {
				return aValue > bValue ? -1 : 1;
			}
			return 0;
		},
		[sortDirection, sortBy, customSort],
	);

	// Sorted data memo.
	const sortedData = useMemo(() => {
		if (!sortDirection || !sortBy) return data;
		return [...data].sort(comparator);
	}, [data, sortDirection, sortBy, comparator]);

	// Toggle handler.
	const toggleSort = (property: keyof T) => {
		// Toggle direction or reset.

		if (sortBy === property) {
			setSortDirection(
				sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? undefined : 'asc',
			);
		} else {
			setSortBy(property);
			setSortDirection('asc');
		}
	};

	return { sortedData, sortDirection, sortKey: sortBy, sortBy, toggleSort };
}
