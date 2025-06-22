import { memo, useState } from 'react';

import { Box, Button, IconButton, TableCell, TableRow, Tooltip, Typography } from '@mui/material';

import { CheckIcon, CopyIcon, TrashIcon } from '@/icons';

import { useToast } from '@/hooks';
import useDeleteLinkMutation from '@/hooks/data/documentDetails/useDeleteLinkMutation';
import { Contact, LinkDetailRow } from '@/shared/models';
import { formatDateTime } from '@/shared/utils';

import { useModalContext } from '@/providers/modal/ModalProvider';
import LinkVisitorModal from './LinkVisitorModal';

interface InfoTableRowProps {
	variant?: 'linkTable' | 'visitorTable';
	documentDetail: LinkDetailRow | Contact;
}

function InfoTableRow({ documentDetail, variant }: InfoTableRowProps) {
	const [linkVisitorOpen, setLinkVisitorOpen] = useState(false);
	const [isLinkCopied, setIsLinkCopied] = useState(false);
	const { openModal } = useModalContext();
	const { showToast } = useToast();

	const deleteLink = useDeleteLinkMutation();

	const isLinkDetail = (d: LinkDetailRow | Contact): d is LinkDetailRow =>
		(d as LinkDetailRow).createdLink !== undefined;

	const isVisitorDetail = (d: LinkDetailRow | Contact): d is Contact =>
		(d as Contact).name !== undefined;

	const handleOpenLinkVisitorModal = () => {
		setLinkVisitorOpen(true);
	};

	const handleCloseLinkVisitorModal = () => {
		setLinkVisitorOpen(false);
	};

	const handleDelete = () => {
		openModal({
			type: 'deleteConfirm',
			contentProps: {
				title: 'Really delete this link?',
				description:
					'Deleting this link is permanent. All associated share settings will be removed.',
				onConfirm: async () => {
					try {
						const link = documentDetail as LinkDetailRow;
						await deleteLink.mutateAsync({ documentId: link.documentId, linkId: link.linkId });

						showToast({ message: 'Link deleted successfully!', variant: 'success' });
					} catch (err) {
						showToast({ message: 'Error deleting link', variant: 'error' });
					}
				},
			},
		});
	};

	const handleLinkCopy = () => {
		if (isLinkDetail(documentDetail)) {
			navigator.clipboard.writeText(documentDetail.createdLink);
			setIsLinkCopied(true);
			setTimeout(() => {
				setIsLinkCopied(false);
			}, 3000);
		}
	};

	// Render Link Table Row
	if (variant === 'linkTable' && isLinkDetail(documentDetail)) {
		return (
			<>
				<TableRow hover>
					<TableCell
						sx={{ width: '45%', pl: '2.5rem', py: { sm: '0.7rem', md: '0.92rem', lg: '1.18rem' } }}>
						<Box
							display='flex'
							alignItems='center'
							gap={10}>
							<Tooltip
								enterDelay={800}
								title={documentDetail.createdLink}
								slotProps={{
									tooltip: {
										sx: {
											maxWidth: 'none',
											whiteSpace: 'nowrap',
										},
									},
								}}
								placement='bottom-start'>
								<Typography noWrap>
									{documentDetail.alias ? documentDetail.alias : documentDetail.createdLink}
									<IconButton
										sx={{ ml: 10 }}
										onClick={handleLinkCopy}>
										{isLinkCopied ? <CheckIcon /> : <CopyIcon />}
									</IconButton>
								</Typography>
							</Tooltip>
						</Box>
					</TableCell>
					<TableCell sx={{ width: '20%', textAlign: 'center' }}>
						{formatDateTime(documentDetail.lastActivity)}
					</TableCell>
					<TableCell sx={{ width: '10%', textAlign: 'center' }}>
						{documentDetail.linkViews}
					</TableCell>
					<TableCell sx={{ width: '10%', textAlign: 'center' }}>
						<IconButton onClick={handleDelete}>
							<Box
								component={TrashIcon}
								width={{ sm: '1rem', md: '1.04rem', lg: '1.08rem' }}
								height='auto'
							/>
						</IconButton>
					</TableCell>
					<TableCell sx={{ width: '15%', textAlign: 'center' }}>
						<Tooltip
							title='View visitors'
							placement='bottom'>
							<Button
								variant='outlined'
								size='small'
								onClick={handleOpenLinkVisitorModal}>
								View Log
							</Button>
						</Tooltip>
					</TableCell>
				</TableRow>

				{/* Link Visitor Modal */}
				<LinkVisitorModal
					open={linkVisitorOpen}
					documentId={documentDetail.documentId}
					linkId={documentDetail.linkId}
					linkAlias={documentDetail.alias || documentDetail.createdLink}
					onClose={handleCloseLinkVisitorModal}
				/>
			</>
		);
	}

	// Render Visitor Table Row
	if (variant === 'visitorTable' && isVisitorDetail(documentDetail)) {
		return (
			<TableRow hover>
				<TableCell sx={{ width: '30%', pl: '2.5rem' }}>
					{documentDetail.name ? documentDetail.name : 'N/A'}
					<br />
					<Typography variant='caption'>
						{documentDetail.email ? documentDetail.email : 'N/A'}
					</Typography>
				</TableCell>
				<TableCell sx={{ width: '25%', textAlign: 'center' }}>
					{formatDateTime(documentDetail.lastActivity)}
				</TableCell>
				<TableCell sx={{ width: '15%', textAlign: 'center' }}>{documentDetail.downloads}</TableCell>
				<TableCell sx={{ width: '15%', textAlign: 'center' }}>{documentDetail.duration}</TableCell>
				<TableCell sx={{ width: '15%', textAlign: 'center' }}>
					{documentDetail.completion}
				</TableCell>
			</TableRow>
		);
	}

	// If neither variant matches or the data is incomplete
	return null;
}

export default memo(InfoTableRow);
