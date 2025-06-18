'use client';

import {
	Box,
	CircularProgress,
	Paper,
	Table,
	TableBody,
	TableContainer,
	TableHead,
	Typography,
} from '@mui/material';

import DocumentsTableHeader from './DocumentsTableHeader';
import DocumentsTableRow from './DocumentsTableRow';

import { Paginator } from '@/components';

import { usePaginatedTable, useResponsivePageSize, useToast } from '@/hooks';
import { useDeleteDocumentMutation, useDocumentsQuery } from '@/hooks/data';

import { DocumentType } from '@/shared/models';

const DocumentsTable = () => {
	const { showToast } = useToast();

	const { data, error, isLoading } = useDocumentsQuery();
	const allDocs = data?.documents ?? [];

	const { mutate: deleteDocument } = useDeleteDocumentMutation();

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
	} = usePaginatedTable<DocumentType>(allDocs, { initialSort: 'createdAt', pageSize: 4 });

	//Calculate the pageSize based on resizing
	useResponsivePageSize(setPageSize, { offsetHeight: 500 });

	const handleDocumentDelete = async (documentId: string) => {
		deleteDocument(documentId, {
			onSuccess: () => {
				showToast({
					message: 'Document deleted successfully',
					variant: 'success',
				});
			},
			onError: () => {
				showToast({
					message: 'Error deleting document',
					variant: 'error',
				});
			},
		});
	};

	if (isLoading) {
		return (
			<Box
				display='flex'
				justifyContent='center'
				alignItems='center'
				minHeight='50vh'>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box
				display='flex'
				justifyContent='center'
				alignItems='center'
				minHeight='50vh'>
				<Typography color='error'>{error.message}</Typography>
			</Box>
		);
	}

	return (
		<Box
			display='flex'
			flexDirection='column'
			justifyContent='space-between'
			minWidth='100%'
			flexGrow={1}>
			<TableContainer component={Paper}>
				<Table aria-label='documents table'>
					<TableHead>
						<DocumentsTableHeader
							orderBy={sortKey}
							orderDirection={sortDirection}
							onSort={toggleSort}
						/>
					</TableHead>
					<TableBody>
						{pageData.map((document, index) => (
							<DocumentsTableRow
								key={index}
								document={document}
								onDelete={handleDocumentDelete}
							/>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{totalPages > 1 && (
				<Box>
					<Paginator
						nextPage={page}
						totalPages={totalPages}
						onPageChange={setPage}
						pageSize={pageSize}
						totalItems={allDocs.length}
					/>
				</Box>
			)}
		</Box>
	);
};

export default DocumentsTable;
