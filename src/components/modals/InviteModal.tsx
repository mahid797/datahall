'use client';
import React, { useState, FormEvent } from 'react';
import {
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import Dropdown from '../input/Dropdown';

interface InviteModalProps {
	closeModal: () => void;
	// If you want a callback when the user finishes inviting:
	onInvite?: (email: string, role: string) => void;
	// You can pass a defaultEmail or defaultRole here if you like
}

export default function InviteModal({ closeModal, onInvite }: InviteModalProps) {
	const [email, setEmail] = useState('');
	const [role, setRole] = useState('Select role');

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		// Possibly do something with 'email' and 'role'
		if (onInvite && role !== 'Select role' && email) {
			onInvite(email, role);
		}
		closeModal();
	}

	return (
		<>
			<DialogTitle variant='h2'>Invite a User</DialogTitle>
			<DialogContent>
				<Typography
					variant='body1'
					mb={3}>
					Please enter the user’s email and select a role.
				</Typography>

				<form onSubmit={handleSubmit}>
					<Grid
						container
						rowSpacing={4}
						flexDirection='column'>
						<Grid>
							<TextField
								variant='outlined'
								placeholder='Email'
								size='small'
								type='email'
								fullWidth
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								sx={{
									'& .MuiInputBase-input::placeholder': { color: '#667085', opacity: 1 },
									'& .MuiOutlinedInput-root': {
										'& fieldset': {
											borderRadius: 2,
										},
									},
								}}
							/>
						</Grid>
						<Grid>
							<Dropdown
								initialValue='Select role'
								variant='outlined'
								isSelectFullWidth
								options={[
									{ value: 'Select role', label: 'Select role' },
									{ value: 'Administrator', label: 'Administrator' },
									{ value: 'Member', label: 'Member' },
								]}
								onValueChange={(newRole) => setRole(newRole)}
							/>
						</Grid>
					</Grid>
				</form>
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
					onClick={handleSubmit}>
					Invite
				</Button>
			</DialogActions>
		</>
	);
}
