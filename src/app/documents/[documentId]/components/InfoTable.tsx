'use client';
import {
	Box,
	Button,
	CircularProgress,
	Paper,
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import { useMemo } from 'react';

import { EmptyState, Paginator } from '@/components';
import InfoTableHeader from './InfoTableHeader';
import InfoTableRow from './InfoTableRow';

import { usePaginatedTable, useResponsivePageSize } from '@/hooks';
import { useDocumentLinksQuery, useDocumentVisitorsQuery } from '@/hooks/data';
import { Contact, LinkDetailRow } from '@/shared/models';

interface InfoTableProps {
	variant: 'linkTable' | 'visitorTable';
	documentId: string;
}

// InfoTable - Renders either a "link table" or "visitor table" based on the `variant`.
export default function InfoTable({ variant, documentId }: InfoTableProps) {
	/* ── data fetch ─────────── */
	const {
		data: linkData = [],
		isPending: linksPending,
		error: linksError,
	} = useDocumentLinksQuery(documentId);

	const {
		data: visitorData = [],
		isPending: visitorsPending,
		error: visitorsError,
	} = useDocumentVisitorsQuery(documentId);

	const raw: Array<LinkDetailRow | Contact> = variant === 'linkTable' ? linkData : visitorData;

	const isPending = variant === 'linkTable' ? linksPending : visitorsPending;
	const error = variant === 'linkTable' ? linksError : visitorsError;

	/* ── sort + paging util ──────────── */
	const {
		pageData,
		page,
		totalPages,
		setPage,
		pageSize,
		setPageSize,
		sortKey,
		sortDirection,
		toggleSort,
	} = usePaginatedTable(raw, { initialSort: 'lastActivity', pageSize: 4 });

	/* ── responsive rows-per-page ────── */
	// TODO: Make sure the offsetHeight and rowHeights looks good on all screen sizes
	const { rowHeight } = useResponsivePageSize(setPageSize, {
		offsetHeight: 700,
		rowHeights: { lg: 59, md: 54, sm: 47 },
	});

	/* ── column metadata ────────────── */
	const columns = useMemo(
		() =>
			variant === 'linkTable'
				? [
						{ key: 'link', label: 'LINK', width: '45%' },
						{ key: 'lastActivity', label: 'LAST VIEWED', width: '20%', sortable: true },
						{ key: 'views', label: 'VIEWS', width: '10%' },
						{ key: 'action', label: 'ACTION', width: '10%' },
						{ key: 'blank', label: '', width: '15%' },
					]
				: [
						{ key: 'visitor', label: 'VISITOR', width: '30%' },
						{ key: 'lastActivity', label: 'LAST VIEWED', width: '25%', sortable: true },
						{ key: 'downloads', label: 'DOWNLOADS', width: '15%' },
						{ key: 'duration', label: 'DURATION', width: '15%' },
						{ key: 'completion', label: 'COMPLETION', width: '15%' },
					],
		[variant],
	);

	if (error) {
		return (
			<Box
				textAlign='center'
				mt={5}>
				<Typography color='error'>{(error as Error).message}</Typography>
			</Box>
		);
	}

	const isTableEmpty = !isPending && pageData.length === 0;

	return (
		<Box>
			<TableContainer component={Paper}>
				<Table
					aria-label='Info table'
					stickyHeader>
					<TableHead>
						<InfoTableHeader
							columns={columns}
							sortKey={sortKey}
							sortDirection={sortDirection}
							onSort={(k) => toggleSort(k as any)}
						/>
					</TableHead>

					<TableBody>
						{/* Render sorted & paginated rows */}
						{isPending &&
							Array.from({ length: pageSize }).map((_, index) => (
								<TableRow
									key={index}
									hover>
									{columns.map(({ key, width }) => (
										<TableCell
											key={key}
											sx={{ width, py: 1.25 }}>
											<Skeleton
												key={index}
												animation='wave'
												variant='rectangular'
												height={rowHeight * 0.55}
												width='100%'
												sx={{ borderRadius: 2, mx: 'auto' }}
											/>
										</TableCell>
									))}
								</TableRow>
							))}

						{pageData.map((detail, index) => (
							<InfoTableRow
								key={index}
								documentDetail={detail}
								variant={variant}
							/>
						))}

						{/* TODO: If linkTable has zero data, show "Create a link" row */}
						{isTableEmpty && (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									sx={{ textAlign: 'center', py: { sm: '0.5rem', md: '0.7rem', lg: '0.9rem' } }}>
									{variant === 'linkTable' ? (
										<Button
											variant='contained'
											sx={{ px: { sm: 50, md: 60, lg: 70 } }}>
											Create a link
										</Button>
									) : (
										<EmptyState message='No visitor data found.' />
									)}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{totalPages > 1 && (
				<Paginator
					nextPage={page}
					totalPages={totalPages}
					onPageChange={setPage}
					pageSize={pageSize}
					totalItems={raw.length}
				/>
			)}
		</Box>
	);
}
