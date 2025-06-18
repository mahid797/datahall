import { Menu, MenuItem, Typography } from '@mui/material';

import CreateLink from './CreateLink';
import ShareLinkDialog from './ShareLinkDialog';

import { useToast } from '@/hooks';
import { useModalContext } from '@/providers/modal/ModalProvider';

interface Props {
	open: boolean;
	documentId: string;
	onClose: () => void;
	anchorEl: HTMLElement | null;
	onDelete: (documentId: string) => void;
	onAnalytics?: () => void;
}

export default function ActionMenu({
	anchorEl,
	open,
	onClose,
	documentId,
	onDelete,
	onAnalytics,
}: Props) {
	const { openModal } = useModalContext();
	const { showToast } = useToast();

	// Outdated code for opening a create link dialog
	// const [newLinkUrl, setNewLinkUrl] = useState('');
	// const [createLinkOpen, setCreateLinkOpen] = useState(false);

	const handleOpenCreateLink = () => {
		openModal({
			type: 'createLink',
			contentProps: {
				documentId,
				onLinkGenerated: (linkUrl: string) => {
					openModal({
						type: 'shareableLink',
						contentProps: { linkUrl },
					});
				},
			},
		});
		onClose();
	};

	const handleDelete = () => {
		openModal({
			type: 'deleteConfirm',
			contentProps: {
				description:
					'When you delete this file, all the links associated with the file will also be removed. This action is non-reversible.',
				onConfirm: () => {
					onDelete(documentId);
				},
			},
		});
	};

	const handleUpload = () => {
		openModal({
			type: 'uploadFile',
			contentProps: {
				title: 'Update with a new document',
				description: 'When you update with a new document, the current link won’t change.',
				onUploadComplete: () => {
					console.log('Document updated successfully!');
					showToast({
						message: 'Document updated successfully!',
						variant: 'success',
					});
				},
			},
		});
	};

	return (
		<>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={onClose}
				disableScrollLock={true}>
				<MenuItem onClick={handleOpenCreateLink}>Create link</MenuItem>
				{/* <MenuItem onClick={onClose}>Duplicate document</MenuItem> */}
				{/* <MenuItem onClick={handleUpload}>Update document</MenuItem> */}
				{onAnalytics && <MenuItem onClick={onAnalytics}>View analytics</MenuItem>}
				<MenuItem onClick={handleDelete}>
					<Typography
						variant='body1'
						color='error'>
						Delete
					</Typography>
				</MenuItem>
			</Menu>

			{/* Uncomment the following lines to enable the OLD CreateLink and ShareLinkDialog components */}
			{/* CREATE LINK DIALOG */}
			{/* <CreateLink
				open={createLinkOpen}
				documentId={documentId}
				onClose={handleCloseCreateLink}
			/> */}

			{/* SHAREABLE LINK DIALOG */}
			{/* <ShareLinkDialog
				linkUrl={newLinkUrl}
				onClose={() => setNewLinkUrl('')} // hide the dialog
			/> */}
		</>
	);
}
