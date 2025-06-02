import { useState } from 'react';

import { Box, Chip, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';

import { CheckIcon, CopyIcon, LinkIcon } from '@/icons';

<<<<<<<< HEAD:src/app/documents/components/NewLinkDialog.tsx
interface NewLinkDialogProps {
========
interface ShareLinkDialogProps {
>>>>>>>> dev:src/app/documents/components/ShareLinkDialog.tsx
	linkUrl: string;
	onClose: () => void;
}

<<<<<<<< HEAD:src/app/documents/components/NewLinkDialog.tsx
export default function NewLinkDialog({ linkUrl, onClose }: NewLinkDialogProps) {
	const [isLinkCopied, setIsLinkCopied] = React.useState(false);
========
export default function ShareLinkDialog({ linkUrl, onClose }: ShareLinkDialogProps) {
	const [copied, setCopied] = useState(false);
>>>>>>>> dev:src/app/documents/components/ShareLinkDialog.tsx

	function handleCopy() {
		navigator.clipboard.writeText(linkUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 3000);
	}

	const showDialog = Boolean(linkUrl);

	return (
		<Dialog
			open={showDialog}
			onClose={onClose}
			fullWidth
			maxWidth='sm'>
			<Box
				display='flex'
				justifyContent='space-between'
				alignItems='center'
				width='100%'>
				<DialogTitle variant='h2'>New link</DialogTitle>
			</Box>

			<DialogContent
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 5,
					width: '100%',
				}}>
				<Chip
					color='secondary'
					icon={<LinkIcon />}
					label={linkUrl}
					sx={{
						typography: 'h4',
						flexGrow: 1,
						justifyContent: 'left',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					}}
				/>

				<IconButton
					onClick={handleCopy}
					sx={{ transition: '0.2s' }}>
					{copied ? (
						<CheckIcon
							width={15}
							height={15}
						/>
					) : (
						<CopyIcon />
					)}
				</IconButton>
			</DialogContent>
		</Dialog>
	);
}
