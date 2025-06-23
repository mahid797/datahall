'use client';

import { Box, Typography } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { FormProvider } from 'react-hook-form';

import { FormInput, LoadingButton, NavLink, PasswordValidation } from '@/components';
import AuthFormWrapper from '../components/AuthFormWrapper';

import { LockIcon } from '@/icons';

import { useToast } from '@/hooks';
import { useResetPasswordMutation } from '@/hooks/data';
import { useFormSubmission, useResetPasswordForm } from '@/hooks/forms';

export default function ResetPassword() {
	const router = useRouter();
	const params = useSearchParams();
	const token = params.get('token') ?? '';
	const toast = useToast();

	/* ------------- early-guard: no token ------------- */
	useEffect(() => {
		if (!token) {
			toast.showToast({
				message: 'Reset link is invalid or expired',
				variant: 'error',
			});
			router.replace('/auth/forgot-password');
		}
	}, [token, router, toast]);

	const form = useResetPasswordForm();
	const {
		register,
		formState: { errors, isValid, touchedFields },
		watchPassword,
		isPasswordTouched,
	} = form;

	const resetMutation = useResetPasswordMutation();

	const { loading, handleSubmit } = useFormSubmission({
		validate: () => isValid,
		onSubmit: async () => {
			await resetMutation.mutateAsync({
				token,
				newPassword: form.getValues('newPassword'),
			});
		},
		onSuccess: () => router.push('/auth/sign-in?reset=done'),
		onError: (err) => {
			const message = (err as any)?.response?.data?.message ?? 'Could not reset password';
			toast.showToast({ message, variant: 'error' });
		},
		skipDefaultToast: true,
	});

	return (
		<AuthFormWrapper>
			<Box
				width={56}
				height={56}
				border='1px solid #EAECF0'
				display='flex'
				justifyContent='center'
				boxShadow='0px 1px 2px 0px #1018280D'
				alignItems='center'
				borderRadius='12px'>
				<LockIcon />
			</Box>

			<Typography
				variant='h2'
				mb={4}>
				Set new password
			</Typography>

			<Typography
				variant='subtitle2'
				mb={4}
				textAlign='center'>
				Your new password must be different from previously used passwords.
			</Typography>

			<FormProvider {...form}>
				<Box
					component='form'
					onSubmit={handleSubmit}
					noValidate
					minWidth={400}
					display='flex'
					flexDirection='column'
					gap={{ sm: 8, md: 9, lg: 10 }}>
					<FormInput
						label='New Password'
						type='password'
						placeholder='Create a password'
						{...register('newPassword')}
						errorMessage={errors.newPassword?.message}
					/>

					<FormInput
						label='Confirm password'
						type='password'
						placeholder='Confirm your password'
						{...register('confirmPassword')}
						errorMessage={errors.confirmPassword?.message}
					/>

					<PasswordValidation
						passwordValue={watchPassword}
						isBlur={isPasswordTouched}
					/>

					<LoadingButton
						type='submit'
						loading={loading}
						disabled={!isValid}
						buttonText='Reset password'
						loadingText='Resetting Password...'
					/>
				</Box>
			</FormProvider>
			<NavLink
				href='/auth/sign-in'
				linkText='← Back to sign in'
				prefetch
			/>
		</AuthFormWrapper>
	);
}
