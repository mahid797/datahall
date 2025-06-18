import {
	Box,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@mui/material';

import { EmptyState, Paginator } from '@/components';

import { useLinkVisitorsQuery } from '@/hooks/data';

import { LinkVisitor } from '@/shared/models';
import { formatDateTime } from '@/shared/utils';
import { usePaginatedTable, useResponsivePageSize } from '@/hooks';

interface LinkVisitorModalProps {
	open: boolean;
	documentId: string;
	linkId: string;
	linkAlias: string;
	onClose: () => void;
}

export default function LinkVisitorModal({
	open,
	documentId,
	linkId,
	linkAlias,
	onClose,
}: LinkVisitorModalProps) {
	const { data, isPending } = useLinkVisitorsQuery(documentId, linkId, open);

	const { pageData, page, totalPages, setPage, pageSize, setPageSize } =
		usePaginatedTable<LinkVisitor>(data ?? [], { pageSize: 10 });

	/* responsive pageSize inside modal */
	useResponsivePageSize(setPageSize, { offsetHeight: 500 });

	const formatVisitorMetaData = (metaData: string | null): string => {
		if (!metaData) return 'N/A';

		try {
			const parsed = JSON.parse(metaData);
			if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
				return Object.entries(parsed)
					.map(([key, val]) => `${key}: ${val}`)
					.join(', ');
			}
			return String(parsed);
		} catch {
			return metaData;
		}
	};
	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth='md'>
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
					<Table
						aria-label='Info table'
						stickyHeader>
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
									<TableCell
										colSpan={4}
										sx={{ width: '100%' }}>
										<Box
											display='flex'
											justifyContent='center'
											mt={4}>
											<CircularProgress />
										</Box>
									</TableCell>
								</TableRow>
							)}

							{!isPending && pageData?.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={4}
										sx={{ width: '100%' }}>
										<EmptyState message='No visitors have accessed this link yet.' />
									</TableCell>
								</TableRow>
							) : (
								pageData?.map((visitor: LinkVisitor) => (
									<TableRow key={visitor.id}>
										<TableCell
											sx={{
												width: '27%',
												pl: '2.5rem',
												py: { sm: '0.98rem', md: '1.1rem', lg: '1.3rem' },
											}}>
											{visitor.name ? visitor.name : 'N/A'}
										</TableCell>
										<TableCell sx={{ width: '33%', pl: '1.25rem' }}>
											{visitor.email ? visitor.email : 'N/A'}
										</TableCell>
										<TableCell sx={{ width: '23%', textAlign: 'center' }}>
											{formatDateTime(visitor.visitedAt, { includeTime: true })}
										</TableCell>
										<TableCell sx={{ width: '17%', textAlign: 'center' }}>
											{formatVisitorMetaData(visitor.visitorMetaData)}
										</TableCell>
									</TableRow>
								))
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
						totalItems={data?.length ?? 0}
						size='sm'
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}
