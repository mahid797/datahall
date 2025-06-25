'use client';
import { Fragment } from 'react';
import { FormProvider } from 'react-hook-form';

import { Box, DialogActions, DialogContent, Divider, IconButton, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { FormInput, LoadingButton } from '@/components';
import { useCreateLinkVisitorMutation } from '@/hooks/data';
import { useFormSubmission } from '@/hooks/forms';
import { useDocumentAccessForm } from '@/hooks/forms/useDocumentAccessForm';

import { EyeIcon, EyeOffIcon, FileDownloadIcon } from '@/icons';
import { VisitorFieldKey, visitorFieldsConfigByKey } from '@/shared/config/visitorFieldsConfig';
import { PublicLinkFilePayload } from '@/shared/models';

interface DocumentAccessModalProps {
	linkId: string;
	passwordRequired: boolean;
	visitorFields: VisitorFieldKey[];
	onSubmitSuccess?: (file: PublicLinkFilePayload) => void;
	closeModal: () => void;
}

/**
 * Visitor-side access-gate modal (password & user-info).
 */
export default function DocumentAccessModal({
	linkId,
	passwordRequired,
	visitorFields,
	onSubmitSuccess,
	closeModal,
}: DocumentAccessModalProps) {
	/* ── RHF + Zod form ─────────────────────────────────────────────── */
	const form = useDocumentAccessForm(passwordRequired, visitorFields, 'onChange');
	const {
		register,
		formState: { errors, isValid },
		getPayload,
		showPassword,
		togglePasswordVisibility,
	} = form;

	/* ── API mutation ───────────────────────────────────────────────── */
	const createVisitor = useCreateLinkVisitorMutation();

	const { loading, handleSubmit } = useFormSubmission({
		validate: () => isValid,
		onSubmit: async () => {
			const payload = getPayload();
			const { data } = await createVisitor.mutateAsync({ linkId, payload });
			if (!data) throw new Error('No file data returned.');
			onSubmitSuccess?.(data);
			closeModal();
		},
		successMessage: 'File access granted!',
		skipDefaultToast: true,
	});

	/* ── UI ────────────────────────────────────────────────────── */
	return (
		<FormProvider {...form}>
			<Box
				component='form'
				onSubmit={handleSubmit}
				noValidate>
				{/* HEADER */}
				<Box
					display='flex'
					alignItems='center'
					m={12}>
					<Box
						borderRadius={2}
						p={5}
						border={1}
						borderColor='border.light'>
						<FileDownloadIcon />
					</Box>
					<Box ml={6}>
						<Typography variant='h2'>Your information</Typography>
						<Typography variant='body1'>Enter your details to access the document</Typography>
					</Box>
				</Box>

				<Divider />

				{/* Form Fields */}
				<DialogContent sx={{ m: 4 }}>
					<Grid
						container
						rowSpacing={14}
						columnSpacing={{ sm: 2, md: 4, lg: 8 }}
						alignItems='center'>
						{visitorFields.map((visitorFieldKey) => {
							const [fieldConfig] = visitorFieldsConfigByKey[visitorFieldKey] ?? [];
							if (!fieldConfig) return null;
							return (
								<Fragment key={visitorFieldKey}>
									{/* Visitor fields, e.g., name and email */}
									<Grid size={3}>
										<Typography variant='h3'>{fieldConfig.label}</Typography>
									</Grid>
									<Grid size={passwordRequired ? 8 : 9}>
										<FormInput
											{...register(visitorFieldKey)}
											autoComplete='on'
											placeholder={fieldConfig.placeholder}
											errorMessage={errors[visitorFieldKey]?.message as string}
										/>
									</Grid>
								</Fragment>
							);
						})}

						{/* Password (optional) */}
						{passwordRequired && (
							<>
								{visitorFields.length > 0 && (
									<Grid size={12}>
										<Divider sx={{ borderBottomWidth: 2 }} />
									</Grid>
								)}
								<Grid size={3}>
									<Typography variant='h3'>Password</Typography>
								</Grid>
								<Grid
									display='grid'
									rowGap={5}
									size={8}>
									<Typography variant='body1'>Please enter the password shared with you</Typography>
									<FormInput
										type={showPassword ? 'text' : 'password'}
										{...register('password')}
										errorMessage={errors.password?.message as string}
									/>
								</Grid>
								<Grid size={1}>
									<IconButton onClick={togglePasswordVisibility}>
										{showPassword ? <EyeOffIcon /> : <EyeIcon />}
									</IconButton>
								</Grid>
							</>
						)}
					</Grid>
				</DialogContent>

				<Divider />

				{/* Submit Button */}
				<DialogActions sx={{ p: 0, m: 12 }}>
					<LoadingButton
						type='submit'
						fullWidth
						disabled={!isValid}
						loading={loading}
						buttonText='Confirm'
						loadingText='Confirming…'
					/>
				</DialogActions>
			</Box>
		</FormProvider>
	);
}
