'use client';

import { useEffect, useState } from 'react';
import { FormProvider } from 'react-hook-form';

import { Box, Button, Divider, Link, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { useModalContext } from '@/providers/modal/ModalProvider';

import { useToast } from '@/hooks';
import { useProfileQuery, useUpdateNameMutation } from '@/hooks/data';
import { useFormSubmission, useProfileForm } from '@/hooks/forms';

import { AvatarCard, FormInput, LoadingButton, LoadingSpinner } from '@/components';

export default function ProfileForm() {
	const { data, isLoading: fetchLoading, error } = useProfileQuery();
	const updateName = useUpdateNameMutation();

	const [isEditing, setIsEditing] = useState(false);

	const { openModal } = useModalContext();
	const { showToast } = useToast();

	const form = useProfileForm(data); // NEW helper
	const {
		register,
		reset,
		formState: { errors, isValid },
	} = form;

	useEffect(() => {
		if (data) reset(data);
	}, [data, reset]);

	// Submit data
	const { loading, handleSubmit, toast } = useFormSubmission({
		mutation: updateName,
		getVariables: () => form.getValues(),
		validate: () => isValid,
		successMessage: 'Profile updated!',
		onSuccess: () => setIsEditing(false),
		onError: (err: any) =>
			toast.showToast({
				message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
				variant: 'error',
			}),
		skipDefaultToast: true,
	});

	const handleEditProfileInfo = () => {
		setIsEditing(true);
	};

	const handleCancelEditing = () => {
		reset();
		setIsEditing(false);
	};

	const handleDeleteAccount = () => {
		openModal({
			type: 'deleteConfirm',
			contentProps: {
				title: 'Really delete this account?',
				description:
					'If you delete your account, you will no longer be able to sign in, and all of your data will be deleted. Deleting your account is permanent and non-recoverable.',
				onConfirm: () => {
					console.log('Account deleted successfully!');
					showToast({
						message: 'Account deleted successfully!',
						variant: 'success',
					});
				},
			},
		});
	};

	const handleDeletePhoto = () => {
		openModal({
			type: 'deleteConfirm',
			contentProps: {
				title: 'Really delete this photo?',
				description:
					'When you delete this photo, all the links associated with the photo will also be removed. This action is non-reversible.',
				onConfirm: () => {
					console.log('Photo deleted successfully!');
					showToast({
						message: 'Photo deleted successfully!',
						variant: 'success',
					});
				},
			},
		});
	};

	const handleUploadPhoto = () => {
		openModal({
			type: 'uploadFile',
			contentProps: {
				title: 'Upload profile image',
				maxFileSize: '3 MB',
				fileFormats: 'JPG, PNG',
				onUploadComplete: () => {
					console.log('Photo updated successfully!');
					showToast({
						message: 'Photo updated successfully!',
						variant: 'success',
					});
				},
			},
		});
	};

	const handleChangePassword = () => {
		openModal({ type: 'passwordChange' });
	};

	if (fetchLoading) {
		return <LoadingSpinner />;
	}

	if (error) {
		return (
			<Box
				display='flex'
				justifyContent='center'
				alignItems='center'
				minHeight='50vh'>
				<Typography color='error'>
					{error instanceof Error ? error.message : 'Failed to load profile'}
				</Typography>
			</Box>
		);
	}

	return (
		<>
			<FormProvider {...form}>
				<Box
					component='form'
					onSubmit={handleSubmit}
					noValidate
					autoComplete='off'>
					<Grid
						container
						columnSpacing={{ xs: 1, sm: 2, md: 3 }}
						alignItems='center'>
						{/* Profile title */}
						<Grid size={6}>
							<Typography
								variant='h1'
								color='textPrimary'>
								Profile
							</Typography>
						</Grid>
						<Grid size={6}>
							{/* Edit, Save and Cancel buttons */}
							<Box
								display='flex'
								mb={5}
								mt={3}
								justifyContent='flex-end'>
								{isEditing ? (
									<Box
										display={'flex'}
										gap={4}>
										<Button
											variant='outlined'
											color='secondary'
											size='small'
											onClick={handleCancelEditing}>
											Cancel
										</Button>
										<LoadingButton
											loading={loading}
											size='small'
											buttonText='Save'
											loadingText='Saving...'
											fullWidth={false}
										/>
									</Box>
								) : (
									<Button
										variant='contained'
										size='small'
										onClick={handleEditProfileInfo}>
										Edit
									</Button>
								)}
							</Box>
						</Grid>

						{/* Divider */}
						<Grid size={12}>
							<Divider />
						</Grid>
					</Grid>

					<Grid
						container
						my={10}
						rowSpacing={14}
						columnSpacing={{ xs: 1, sm: 2, md: 3 }}
						alignItems='center'>
						{/* First Name */}
						<Grid size={6}>
							<Typography variant='h4'>First name</Typography>
						</Grid>
						<Grid size={6}>
							<FormInput
								{...register('firstName')}
								errorMessage={errors.firstName?.message}
								disabled={!isEditing}
							/>
						</Grid>

						{/* Last Name */}
						<Grid size={6}>
							<Typography variant='h4'>Last name</Typography>
						</Grid>
						<Grid size={6}>
							<FormInput
								{...register('lastName')}
								errorMessage={errors.lastName?.message}
								disabled={!isEditing}
							/>
						</Grid>

						{/* Email */}
						<Grid size={6}>
							<Typography variant='h4'>Email</Typography>
							<Typography variant='subtitle1'>
								This is your current email address — it cannot be changed.
							</Typography>
						</Grid>
						<Grid size={6}>
							<FormInput
								id='email'
								type='email'
								value={data?.email}
								disabled
							/>
						</Grid>

						{/* TODO: Avatar upload UI temporarily removed */}

						{/* Photo */}
						{/* <Grid size={6}>
							<Typography variant='h4'>Your photo</Typography>
							<Typography variant='subtitle1'>
								This photo will be displayed on your profile page.
							</Typography>
						</Grid>
						<Grid size={6}>
							<AvatarCard
								src='https://picsum.photos/200/200'
								initials='U'
								size={64}
								onDelete={handleDeletePhoto}
								onUpdate={handleUploadPhoto}
								disabled={!isEditing}
							/>
						</Grid> */}

						{/* Password */}
						<Grid
							size={6}
							mt={10}>
							<Typography variant='h4'>Password</Typography>
						</Grid>
						<Grid
							size={6}
							mt={10}>
							<Button
								variant='contained'
								size='medium'
								onClick={handleChangePassword}
								disabled={!isEditing}>
								Change password
							</Button>
						</Grid>
					</Grid>

					<Divider sx={{ mb: 10, mt: 20 }} />

					{/* Delete Account Section */}
					<Box
						display='flex'
						flexDirection='column'
						mb={4}
						rowGap={2}>
						<Typography variant='h4'>Delete account</Typography>
						<Typography variant='subtitle1'>
							Note that deleting your account will remove all data from our system. This is
							permanent and non-recoverable.
						</Typography>
						<Typography
							variant='subtitle1'
							my={5}>
							To Delete your account, please email us at{' '}
							<Link
								href='mailto:dev.datahall@gmail.com'
								underline='hover'
								color='primary'>
								dev.datahall@gmail.com
							</Link>
							.
						</Typography>

						{/* Delete Account Button */}

						{/* <Tooltip
						title='Account deletion is disabled in Development'
						placement='bottom-start'>
						<Box width='9rem'>
							<Button
								variant='contained'
								color='error'
								size='medium'
								onClick={handleDeleteAccount}
								disabled={true}>
								Delete account
							</Button>
						</Box>
					</Tooltip> */}
					</Box>
				</Box>
			</FormProvider>
		</>
	);
}
