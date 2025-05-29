'use client';
import { useState } from 'react';

import { Chip, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';

import { CheckIcon, CopyIcon, LinkIcon } from '@/icons';

interface ShareableLinkModalProps {
	linkUrl: string;
	closeModal: () => void;
}

export default function ShareableLinkModal({ linkUrl, closeModal }: ShareableLinkModalProps) {
	const [isLinkCopied, setIsLinkCopied] = useState(false);

	function handleLinkCopy() {
		if (linkUrl) {
			navigator.clipboard.writeText(linkUrl);
			setIsLinkCopied(true);
			setTimeout(() => setIsLinkCopied(false), 3000);
		}
	}

	return (
		<>
			<DialogTitle variant='h2'>Shareable link</DialogTitle>
			<DialogContent
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 1,
				}}>
				<Chip
					color='secondary'
					icon={<LinkIcon />}
					label={linkUrl}
					sx={{
						typography: 'h4',
						flexGrow: 1,
						justifyContent: 'flex-start',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					}}
				/>
				<IconButton onClick={handleLinkCopy}>
					{isLinkCopied ? (
						<CheckIcon
							width={15}
							height={15}
						/>
					) : (
						<CopyIcon />
					)}
				</IconButton>
			</DialogContent>
			<DialogActions sx={{ mr: 8, mb: 4 }}>
				{/* optional close button? */}
				{/* <Button variant='text' onClick={closeModal}>Close</Button> */}
			</DialogActions>
		</>
	);
}
