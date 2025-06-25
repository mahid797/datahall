'use client';
import axios from 'axios';
import { FormProvider } from 'react-hook-form';
import {
	Box,
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import { FormInput, LoadingButton, PasswordValidation } from '@/components';
import { useUpdatePasswordMutation } from '@/hooks/data';
import { useChangePasswordForm, useFormSubmission } from '@/hooks/forms';
import { EyeIcon, EyeOffIcon, LockIcon } from '@/icons';

interface PasswordChangeModalProps {
	closeModal: () => void;
}

export default function PasswordChangeModal({ closeModal }: PasswordChangeModalProps) {
	/* ——— RHF form hook ——— */
	const form = useChangePasswordForm();
	const {
		visible,
		toggleVisibility,
		watchNewPassword,
		formState: { errors, isValid },
		isNewPasswordTouched,
		reset,
		register,
	} = form;

	/* ——— Server mutation ——— */
	const changePassword = useUpdatePasswordMutation();

	/* ——— Submit helper ——— */
	const { loading, handleSubmit, toast } = useFormSubmission({
		mutation: changePassword,
		getVariables: () => form.getValues(),
		validate: () => isValid,
		successMessage: 'Password updated!',
		onSuccess: () => {
			reset();
			closeModal();
		},
		onError: (e) => {
			const msg = axios.isAxiosError(e)
				? (e.response?.data?.error ?? (e.request ? 'No response from server' : e.message))
				: String(e);
			toast.showToast({ message: `Error: ${msg}`, variant: 'error' });
		},
		skipDefaultToast: true,
	});

	/* ——— UI ——— */
	return (
		<>
			{/* HEADER */}
			<DialogTitle display='flex'>
				<Box
					width={45}
					height={45}
					border={1}
					borderColor='border.light'
					display='flex'
					justifyContent='center'
					alignItems='center'
					boxShadow='0px 1px 2px 0px #1018280D'
					borderRadius={5}
					mr={5}>
					<LockIcon
						width={25}
						height={25}
					/>
				</Box>
				<Box
					display='flex'
					flexDirection='column'
					justifyContent='center'
					gap={1}>
					<Typography variant='h2'>Change Password</Typography>
					<Typography variant='body1'>Enter your current password</Typography>
				</Box>
			</DialogTitle>
			<Divider sx={{ mb: 2 }} />

			{/* FORM BODY */}
			<Box
				component='form'
				autoComplete='off'
				noValidate
				onSubmit={handleSubmit}>
				<FormProvider {...form}>
					<DialogContent>
						<Grid
							container
							columnSpacing={{ sm: 2, md: 4, lg: 6 }}
							rowSpacing={8}
							alignItems='center'>
							{/* Current password */}
							<Grid size={3}>
								<Typography variant='h4'>Current Password</Typography>
							</Grid>
							<Grid size={8}>
								<FormInput
									id='currentPassword'
									type={visible.currentPassword ? 'text' : 'password'}
									{...register('currentPassword')}
									errorMessage={errors.currentPassword?.message}
								/>
							</Grid>
							<Grid size={1}>
								<IconButton onClick={() => toggleVisibility('currentPassword')}>
									{visible.currentPassword ? <EyeOffIcon /> : <EyeIcon />}
								</IconButton>
							</Grid>

							{/* New password */}
							<Grid size={3}>
								<Typography variant='h4'>New Password</Typography>
							</Grid>
							<Grid size={8}>
								<FormInput
									type={visible.newPassword ? 'text' : 'password'}
									{...register('newPassword')}
									errorMessage={errors.newPassword?.message}
								/>
							</Grid>
							<Grid size={1}>
								<IconButton onClick={() => toggleVisibility('newPassword')}>
									{visible.newPassword ? <EyeOffIcon /> : <EyeIcon />}
								</IconButton>
							</Grid>

							{/* Confirm password */}
							<Grid size={3}>
								<Typography variant='h4'>Confirm Password</Typography>
							</Grid>
							<Grid size={8}>
								<FormInput
									type={visible.confirmPassword ? 'text' : 'password'}
									{...register('confirmPassword')}
									errorMessage={errors.confirmPassword?.message}
								/>
							</Grid>
							<Grid size={1}>
								<IconButton onClick={() => toggleVisibility('confirmPassword')}>
									{visible.confirmPassword ? <EyeOffIcon /> : <EyeIcon />}
								</IconButton>
							</Grid>

							{/* Password strength feedback */}
							<Grid
								size={9}
								offset='auto'>
								<PasswordValidation
									passwordValue={watchNewPassword}
									isBlur={isNewPasswordTouched}
								/>
							</Grid>
						</Grid>
					</DialogContent>
				</FormProvider>

				{/* ACTIONS */}
				<DialogActions sx={{ mx: 5, my: 5 }}>
					<Button
						variant='outlined'
						color='secondary'
						size='small'
						onClick={closeModal}>
						Cancel
					</Button>
					<LoadingButton
						type='submit'
						loading={loading}
						buttonText='Confirm'
						size='small'
						loadingText='Confirming...'
						fullWidth={false}
					/>
				</DialogActions>
			</Box>
		</>
	);
}
