import { useEffect, useMemo, useState } from 'react';
import { SortFunction, useSort } from './useSort';

interface Options<T> {
	pageSize?: number;
	initialSort?: keyof T;
	customSort?: SortFunction<T>;
	initialSortOrder?: 'asc' | 'desc' | undefined;
}

/**
 * Combines sorting + paging for table–like views.
 * Internally re-uses useSort so existing custom comparators still work.
 */
export function usePaginatedTable<T>(
	rawData: T[],
	{ pageSize = 4, initialSort, customSort, initialSortOrder }: Options<T> = {},
) {
	/* sort first */
	const { sortedData, sortDirection, sortKey, toggleSort } = useSort<T>(rawData, {
		initialKey: initialSort,
		initialOrder: initialSortOrder,
		customSort,
	});

	/* paging */
	const [page, setPage] = useState(1);
	const [size, setSize] = useState(pageSize);

	const totalPages = Math.max(1, Math.ceil(sortedData.length / size));

	/* reset to page 1 whenever sort key or size changes */
	useEffect(() => {
		setPage(1);
	}, [sortKey, sortDirection, size]);

	const pageData = useMemo(() => {
		const start = (page - 1) * size;
		return sortedData.slice(start, start + size);
	}, [sortedData, page, size]);

	const setPageSafe = (next: number) => setPage(Math.min(Math.max(1, next), totalPages));

	return {
		pageData,
		page,
		totalPages,
		setPage: setPageSafe,
		setPageSize: setSize,
		pageSize: size,
		sortKey,
		sortDirection,
		toggleSort,
	};
}
