'use client';

import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { FormProvider } from 'react-hook-form';

import { FormInput, LoadingButton, NavLink } from '@/components';
import AuthFormWrapper from '../components/AuthFormWrapper';

import { KeyIcon } from '@/icons';

import { useToast } from '@/hooks';
import { useForgotPasswordMutation } from '@/hooks/data';
import { useForgotPasswordForm, useFormSubmission } from '@/hooks/forms';

export default function ForgotPassword() {
	const router = useRouter();

	const form = useForgotPasswordForm();
	const {
		register,
		formState: { errors, isValid },
	} = form;

	const forgotMutation = useForgotPasswordMutation();
	const toast = useToast();

	const { loading, handleSubmit } = useFormSubmission({
		mutation: forgotMutation,
		getVariables: () => form.getValues(),
		validate: () => isValid,
		onSuccess: () => router.push('/auth/sign-in?reset=sent'),
		onError: (err) => {
			const message = (err as any)?.response?.data?.message ?? 'Failed to send reset e-mail.';
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
				<KeyIcon />
			</Box>

			<Typography
				variant='h2'
				mb={4}>
				Forgot password?
			</Typography>

			<Typography
				variant='subtitle2'
				color='text.secondary'
				mb={4}
				textAlign='center'>
				No worries, we’ll send you reset instructions.
			</Typography>
			<FormProvider {...form}>
				<Box
					component='form'
					onSubmit={handleSubmit}
					noValidate
					minWidth={400}
					display='flex'
					flexDirection='column'
					gap={5}>
					<FormInput
						label='Email'
						type='email'
						placeholder='Enter your email'
						{...register('email')}
						errorMessage={errors.email?.message}
					/>

					<Box
						mt={10}
						display='flex'
						justifyContent='center'
						flexDirection='column'
						alignItems='center'
						gap={8}>
						<LoadingButton
							type='submit'
							loading={loading}
							disabled={!isValid}
							buttonText='Reset password'
							loadingText='Sending reset link…'
							fullWidth
						/>

						<NavLink
							href='/auth/sign-in'
							linkText='← Back to sign in'
							prefetch
						/>
					</Box>
				</Box>
			</FormProvider>
		</AuthFormWrapper>
	);
}
