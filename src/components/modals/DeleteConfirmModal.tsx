import React from 'react';
import {
	Button,
	Typography,
	DialogActions,
	DialogContentText,
	DialogTitle,
	DialogContent,
} from '@mui/material';

interface DeleteConfirmModalProps {
	title?: string;
	description?: string;
	onConfirm?: () => void;
	closeModal: () => void;
}

export default function DeleteConfirmModal({
	title = 'Really delete this file?',
	description,
	onConfirm,
	closeModal,
}: DeleteConfirmModalProps) {
	function handleDelete() {
		// Fire parent's callback if present
		if (onConfirm) {
			onConfirm();
		}
		// Then close
		closeModal();
	}

	return (
		<>
			<DialogTitle variant='h2'>{title}</DialogTitle>
			<DialogContent>
				{description && <Typography variant='body1'>{description}</Typography>}
			</DialogContent>

			<DialogActions sx={{ mr: 8, my: 7 }}>
				<Button
					variant='text'
					color='secondary'
					onClick={closeModal}>
					Cancel
				</Button>
				<Button
					variant='contained'
					color='error'
					onClick={handleDelete}>
					Delete
				</Button>
			</DialogActions>
		</>
	);
}
