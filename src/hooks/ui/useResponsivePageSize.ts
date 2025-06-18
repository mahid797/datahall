import { useEffect, useRef, useState } from 'react';

/**
 * Calculates an appropriate `pageSize` for tables based on
 * viewport dimensions and row height break-points.
 *
 * @param setPageSize   – callback from `usePaginatedTable`
 * @param offsetHeight  – pixels to reserve for header / footer (default 200)
 * @param rowHeights    – { lg, md, sm } row-height map (default 59/54/47)
 */
interface SizeOptions {
	offsetHeight?: number;
	rowHeights?: { lg: number; md: number; sm: number };
}

export function useResponsivePageSize(
	setPageSize: (n: number) => void,
	{ offsetHeight = 200, rowHeights = { lg: 59, md: 54, sm: 47 } }: SizeOptions = {},
) {
	const [rowHeight, setRowHeight] = useState<number>(rowHeights.lg);

	const pageSizeSetter = useRef(setPageSize);
	pageSizeSetter.current = setPageSize;

	const pageSizeConfigRef = useRef({ offsetHeight, rowHeights });
	pageSizeConfigRef.current = { offsetHeight, rowHeights };

	useEffect(() => {
		let raf = 0;

		/** derive row-height from viewport width, then pageSize from height */
		const calculateRowHeight = () => {
			const { offsetHeight: offsetHeightRef, rowHeights: rowHeightsRef } =
				pageSizeConfigRef.current;

			const width = window.innerWidth;
			const height =
				width >= 1200 ? rowHeightsRef.lg : width >= 900 ? rowHeightsRef.md : rowHeightsRef.sm;

			setRowHeight(height);

			const available = window.innerHeight - offsetHeightRef;
			const rowsPerPage = Math.max(1, Math.floor(available / height));
			pageSizeSetter.current(rowsPerPage);
		};

		const onResize = () => {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(calculateRowHeight);
		};

		/* initial run + listener */
		calculateRowHeight();
		window.addEventListener('resize', onResize);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', onResize);
		};
	}, []);

	return { rowHeight };
}

export default useResponsivePageSize;
