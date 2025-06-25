'use client';
import { useState } from 'react';

import { Button, Chip, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';

import { CheckIcon, CopyIcon, LinkIcon, XCloseIcon } from '@/icons';

interface LinkCopyModalProps {
	linkUrl: string;
	closeModal: () => void;
}

export default function LinkCopyModal({ linkUrl, closeModal }: LinkCopyModalProps) {
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
			<IconButton
				sx={(theme) => ({
					position: 'absolute',
					right: 8,
					top: 8,
				})}
				onClick={closeModal}>
				<XCloseIcon />
			</IconButton>

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
			{/* <DialogActions sx={{ mr: 8, mb: 4 }}>
				<Button
					variant='text'
					onClick={closeModal}>
					Close
				</Button>
			</DialogActions> */}
		</>
	);
}
