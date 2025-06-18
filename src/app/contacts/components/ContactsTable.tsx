'use client';

import { ChevronDownIcon, ChevronSelectorVerticalIcon } from '@/icons';

import {
	Box,
	CircularProgress,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableSortLabel,
	Typography,
} from '@mui/material';

import { EmptyState, Paginator } from '@/components';

import ContactsTableRow from './ContactsTableRow';

import { usePaginatedTable, useResponsivePageSize } from '@/hooks';
import { useContactsQuery } from '@/hooks/data';

import { Contact } from '@/shared/models';

export default function ContactsTable() {
	const { data, isLoading, isError, error } = useContactsQuery();

	const parsedContacts: Contact[] =
		data?.map((contact) => ({
			...contact,
			lastActivity: new Date(contact.lastActivity),
		})) ?? [];

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
	} = usePaginatedTable<Contact>(parsedContacts, { initialSort: 'lastActivity', pageSize: 9 });

	//Calculate the pageSize based on resizing
	useResponsivePageSize(setPageSize, { offsetHeight: 200 });

	if (isLoading) {
		return (
			<Box
				display='flex'
				justifyContent='center'
				mt={4}>
				<CircularProgress />
			</Box>
		);
	}

	if (isError) {
		return (
			<Box mt={4}>
				<Typography
					color='error'
					align='center'
					variant='h6'>
					{error.message}
				</Typography>
			</Box>
		);
	}

	return (
		<>
			<TableContainer component={Paper}>
				<Table aria-label='Contacts Table'>
					<TableHead>
						<TableRow>
							<TableCell sx={{ width: '30%', pl: '2rem' }}>NAME</TableCell>
							<TableCell sx={{ width: '25%' }}>LAST VIEWED LINK</TableCell>
							<TableCell sx={{ width: '30%', textAlign: 'center' }}>
								<TableSortLabel
									active={sortKey === 'lastActivity'}
									direction={sortDirection}
									onClick={() => toggleSort('lastActivity')}
									hideSortIcon={false}
									IconComponent={
										sortDirection === undefined ? ChevronSelectorVerticalIcon : ChevronDownIcon
									}>
									LAST ACTIVITY
								</TableSortLabel>
							</TableCell>
							<TableCell sx={{ width: '15%', textAlign: 'center' }}>VISITS</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{!pageData.length ? (
							<TableRow>
								<TableCell
									colSpan={4}
									sx={{ width: '100%' }}>
									<EmptyState message='When users download a file and provide personal information, they will appear here.' />
								</TableCell>
							</TableRow>
						) : (
							pageData.map((row) => (
								<ContactsTableRow
									key={row.id}
									contact={row}
								/>
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
					totalItems={parsedContacts.length}
				/>
			)}
		</>
	);
}
