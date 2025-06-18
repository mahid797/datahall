import { TableCell, TableRow, TableSortLabel } from '@mui/material';

import { ChevronDownIcon, ChevronSelectorVerticalIcon } from '@/icons';

interface ColumnProps {
	key: string;
	label: string;
	width?: string;
	sortable?: boolean;
}

interface InfoTableHeaderProps {
	columns: ColumnProps[];
	sortKey?: string;
	sortDirection?: 'asc' | 'desc' | undefined;
	onSort?: (key: string) => void;
}

export default function InfoTableHeader({
	columns,
	sortKey,
	sortDirection,
	onSort,
}: InfoTableHeaderProps) {
	// visitorTable
	return (
		<TableRow>
			{columns.map(({ key, label, width, sortable }) => (
				<TableCell
					key={key}
					sx={{
						width,
						textAlign: key === 'link' || key === 'visitor' ? 'initial' : 'center',
						pl: key === 'link' || key === 'visitor' ? '2.5rem' : 0,
					}}
					scope='col'>
					{sortable ? (
						<TableSortLabel
							active={sortKey === key}
							direction={sortDirection}
							onClick={() => onSort?.(key)}
							hideSortIcon={false}
							sx={{
								pl: key === 'lastActivity' || key === 'lastActivity' ? '1rem' : 0,
							}}
							IconComponent={
								sortDirection && sortKey === key ? ChevronDownIcon : ChevronSelectorVerticalIcon
							}>
							{label}
						</TableSortLabel>
					) : (
						label
					)}
				</TableCell>
			))}
		</TableRow>
	);
}
