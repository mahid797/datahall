import { TableCell, TableRow, TableSortLabel } from '@mui/material';

import { DocumentType } from '@/shared/models';

import { ChevronDownIcon, ChevronSelectorVerticalIcon } from '@/icons';

interface Props {
	orderBy: keyof DocumentType | undefined;
	orderDirection: 'asc' | 'desc' | undefined;
	onSort: (property: keyof DocumentType) => void;
}

const DocumentsTableHeader = ({ orderBy, orderDirection, onSort }: Props) => (
	<TableRow>
		<TableCell sx={{ width: '5%' }}></TableCell>
		<TableCell sx={{ width: '40%' }}>DOCUMENT</TableCell>
		<TableCell sx={{ width: '20%' }}>
			<TableSortLabel
				active={orderBy === 'uploader'}
				direction={orderDirection}
				onClick={() => onSort('uploader')}
				hideSortIcon={false}
				IconComponent={
					orderDirection === undefined ? ChevronSelectorVerticalIcon : ChevronDownIcon
				}>
				UPLOADER
			</TableSortLabel>
		</TableCell>
		<TableCell sx={{ width: '15%', textAlign: 'center' }}>ANALYTICS</TableCell>
		<TableCell sx={{ width: '10%', textAlign: 'center' }}>LINK</TableCell>
		<TableCell sx={{ width: '10%', textAlign: 'center' }}>ACTION</TableCell>
	</TableRow>
);

export default DocumentsTableHeader;
