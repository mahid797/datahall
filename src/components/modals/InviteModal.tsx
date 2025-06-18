'use client';

import React, { useState, FormEvent } from 'react';
import {
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Typography,
	Box,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import Dropdown from '../input/Dropdown';

interface InviteModalProps {
	title?: string;
	description?: string;
	closeModal: () => void;
	// If you want a callback when the user finishes inviting:
	onInvite?: (email: string, role: string) => void;
	// You can pass a defaultEmail or defaultRole here if you like
}

export default function InviteModal({
	title = 'Invite new team member',
	description,
	closeModal,
	onInvite,
}: InviteModalProps) {
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
			<Box
				component='form'
				onSubmit={handleSubmit}>
				<DialogTitle variant='h2'>{title}</DialogTitle>
				<DialogContent>
					<Box mb={12}>
						<Typography variant='body1'>{description}</Typography>
					</Box>

					<Grid
						container
						rowSpacing={14}
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
						type='submit'>
						Send invite
					</Button>
				</DialogActions>
			</Box>
		</>
	);
}
