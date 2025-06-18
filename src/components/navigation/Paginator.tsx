import { Box, Button, Pagination, PaginationItem } from '@mui/material';

import { ArrowNarrowLeftIcon, ArrowNarrowRightIcon } from '@/icons';

interface PaginatorProps {
	nextPage: number;
	totalPages: number;
	onPageChange: (newPage: number) => void;
	pageSize: number;
	totalItems: number;
	size?: 'sm' | 'md' | 'lg';
}

const Paginator = ({
	nextPage,
	totalPages,
	onPageChange,
	pageSize,
	totalItems,
	size = 'md',
}: PaginatorProps) => {
	const handlePageChange = (next: number) => onPageChange(Math.min(Math.max(1, next), totalPages));

	if (totalItems <= pageSize) {
		return null;
	}

	return (
		<Box
			display='flex'
			justifyContent='center'
			alignItems='center'
			mt={size === 'sm' ? '0.5rem' : size === 'lg' ? '2rem' : '1rem'}
			gap={40}>
			<Button
				variant='outlined'
				color='secondary'
				startIcon={<ArrowNarrowLeftIcon />}
				onClick={() => handlePageChange(nextPage - 1)}
				disabled={nextPage === 1}
				sx={{ minWidth: '8rem' }}>
				Previous
			</Button>

			<Pagination
				count={totalPages}
				page={nextPage}
				hideNextButton
				hidePrevButton
				size='medium'
				onChange={(_, value) => handlePageChange(value)}
				shape='rounded'
				color='secondary'
				renderItem={(item) => (
					<PaginationItem
						{...item}
						sx={{ padding: '0 8px' }}
					/>
				)}
			/>
			<Button
				variant='outlined'
				color='secondary'
				endIcon={<ArrowNarrowRightIcon />}
				onClick={() => handlePageChange(nextPage + 1)}
				disabled={nextPage === totalPages}
				sx={{ minWidth: '8rem' }}>
				Next
			</Button>
		</Box>
	);
};

export default Paginator;
