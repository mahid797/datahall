import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useCallback, useMemo, useState } from 'react';

dayjs.extend(utc);

export type SortFunction<T> = (a: T, b: T, orderDirection: 'asc' | 'desc' | undefined) => number;

interface UseSortOptions<T> {
	initialKey?: keyof T;
	initialOrder?: 'asc' | 'desc' | undefined;
	customSort?: SortFunction<T>;
}

/**
 * Lightweight, generic array sorter hook.
 */
export function useSort<T>(
	data: T[],
	{ initialKey, initialOrder = 'desc', customSort }: UseSortOptions<T>,
) {
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(
		initialKey ? initialOrder : undefined,
	);
	const [sortBy, setSortBy] = useState<keyof T | undefined>(initialKey);

	// Memoised comparator function.
	const comparator = useCallback(
		(a: T, b: T) => {
			if (!sortOrder || !sortBy) return 0;

			// 1) If a custom sort function is provided, use it.
			if (customSort) return customSort(a, b, sortOrder);

			let aValue: any = a[sortBy];
			let bValue: any = b[sortBy];

			if (
				typeof aValue === 'string' &&
				typeof bValue === 'string' &&
				dayjs(aValue, undefined, true).isValid() &&
				dayjs(bValue, undefined, true).isValid()
			) {
				const dateA = dayjs.utc(aValue).valueOf();
				const dateB = dayjs.utc(bValue).valueOf();
				return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
			}

			// 2) If both values are Date objects, compare by getTime().
			if (aValue instanceof Date && bValue instanceof Date) {
				return sortOrder === 'asc'
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
			if (sortOrder === 'asc') return aValue < bValue ? -1 : 1;
			if (sortOrder === 'desc') return aValue > bValue ? -1 : 1;
			return 0;
		},
		[sortOrder, sortBy, customSort],
	);

	const sortedData = useMemo(() => {
		if (!sortOrder || !sortBy) return data;
		return [...data].sort(comparator);
	}, [data, sortOrder, sortBy, comparator]);

	const toggleSort = (property: keyof T) => {
		if (sortBy === property) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : sortOrder === 'desc' ? undefined : 'asc');
		} else {
			setSortBy(property);
			setSortOrder('asc');
		}
	};

	return {
		sortedData,
		sortDirection: sortOrder,
		sortKey: sortBy,
		setSortOrder,
		setSortBy,
		toggleSort,
	};
}
