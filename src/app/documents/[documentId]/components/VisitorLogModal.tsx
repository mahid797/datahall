'use client';
import {
	Box,
	Button,
	CircularProgress,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@mui/material';

import { XCloseIcon } from '@/icons';

import { EmptyState, Paginator } from '@/components';

import { usePaginatedTable, useResponsivePageSize } from '@/hooks';
import { useLinkVisitorsQuery } from '@/hooks/data';

import { LinkVisitor } from '@/shared/models';
import { formatDateTime } from '@/shared/utils';

interface VisitorLogModalProps {
	documentId: string;
	linkId: string;
	linkAlias: string;
	closeModal: () => void; // injected by ModalContainer
}

export default function VisitorLogModal({
	documentId,
	linkId,
	linkAlias,
	closeModal,
}: VisitorLogModalProps) {
	/* fetch */
	const { data, isPending } = useLinkVisitorsQuery(documentId, linkId, true);

	/* paging */
	const { pageData, page, totalPages, setPage, pageSize, setPageSize } =
		usePaginatedTable<LinkVisitor>(data ?? [], { pageSize: 10 });

	useResponsivePageSize(setPageSize, { offsetHeight: 500 });

	const formatMeta = (meta: string | null) => {
		if (!meta) return 'N/A';
		try {
			const obj = JSON.parse(meta);
			if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
				return Object.entries(obj)
					.map(([k, v]) => `${k}: ${v}`)
					.join(', ');
			}
		} catch {}
		return meta;
	};

	/* UI */
	return (
		<>
			<DialogTitle
				variant='h2'
				bgcolor='background.primary'
				color='text.tertiary'>
				Visitor Log&nbsp;–&nbsp;{linkAlias}
			</DialogTitle>

			<DialogContent>
				<TableContainer
					component={Paper}
					sx={{ maxHeight: 500, mt: 11 }}>
					<Table stickyHeader>
						<TableHead>
							<TableRow>
								<TableCell sx={{ width: '27%', pl: '2.5rem' }}>NAME</TableCell>
								<TableCell sx={{ width: '33%', pl: '1.25rem' }}>EMAIL</TableCell>
								<TableCell sx={{ width: '23%', textAlign: 'center' }}>VISITED AT</TableCell>
								<TableCell sx={{ width: '17%', textAlign: 'center' }}>METADATA</TableCell>
							</TableRow>
						</TableHead>

						<TableBody>
							{isPending && (
								<TableRow>
									<TableCell colSpan={4}>
										<Box
											display='flex'
											justifyContent='center'
											mt={4}>
											<CircularProgress />
										</Box>
									</TableCell>
								</TableRow>
							)}

							{!isPending && pageData.length === 0 && (
								<TableRow>
									<TableCell colSpan={4}>
										<EmptyState message='No visitors have accessed this link yet.' />
									</TableCell>
								</TableRow>
							)}

							{pageData.map((v) => (
								<TableRow key={v.id}>
									<TableCell sx={{ pl: '2.5rem' }}>{v.name || 'N/A'}</TableCell>
									<TableCell sx={{ pl: '1.25rem' }}>{v.email || 'N/A'}</TableCell>
									<TableCell sx={{ textAlign: 'center' }}>
										{formatDateTime(v.visitedAt, { includeTime: true })}
									</TableCell>
									<TableCell sx={{ textAlign: 'center' }}>
										{formatMeta(v.visitorMetaData)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>

				{totalPages > 1 && (
					<Paginator
						nextPage={page}
						totalPages={totalPages}
						onPageChange={setPage}
						pageSize={pageSize}
						totalItems={data?.length ?? 0}
						size='sm'
					/>
				)}
			</DialogContent>

			<DialogActions sx={{ display: 'flex', justifyContent: 'center' }}>
				<Button
					variant='contained'
					size='small'
					onClick={closeModal}>
					Close
				</Button>
			</DialogActions>
		</>
	);
}
