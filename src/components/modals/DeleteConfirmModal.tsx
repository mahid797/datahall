import React from 'react';
import {
	Button,
	Typography,
	Box,
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
	title = 'Really delete this item?',
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
				{description && (
					<DialogContentText mb={4}>
						<Typography variant='body1'>{description}</Typography>
					</DialogContentText>
				)}
			</DialogContent>

			<DialogActions sx={{ mr: 8, mb: 7 }}>
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
