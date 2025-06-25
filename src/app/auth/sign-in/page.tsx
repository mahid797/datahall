'use client';

import { useRouter } from 'next/navigation';
import { FormProvider } from 'react-hook-form';

import { Box, Typography } from '@mui/material';

import { BlueWaveLogo, FormCheckbox, FormInput, LoadingButton, NavLink } from '@/components';
import AuthFormWrapper from '../components/AuthFormWrapper';

import { useAuthQueryToasts, useSignInMutation } from '@/hooks/data';
import { useFormSubmission, useSignInForm } from '@/hooks/forms';

export default function SignIn() {
	useAuthQueryToasts();
	const router = useRouter();

	const form = useSignInForm();
	const {
		register,
		formState: { errors, isValid },
	} = form;

	const signInMutation = useSignInMutation();

	const { loading, handleSubmit } = useFormSubmission({
		mutation: signInMutation,
		getVariables: () => form.getValues(),
		validate: () => isValid,
		successMessage: 'Successfully signed in! Redirecting…',
		onSuccess: () => router.push('/documents'),
	});

	return (
		<AuthFormWrapper>
			<Box my={{ sm: 8, md: 12, lg: 20 }}>
				<BlueWaveLogo
					width={248}
					height={64}
				/>
			</Box>

			<Typography
				variant='h2'
				mb={{ sm: 10, md: 12, lg: 15 }}>
				Sign in to your account
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
					<Box
						display='flex'
						gap={{ sm: 8, md: 9, lg: 10 }}
						flexDirection='column'>
						<FormInput
							label='Email'
							type='email'
							placeholder='your_email@bluewave.ca'
							{...register('email')}
							errorMessage={errors.email?.message}
						/>

						<FormInput
							label='Password'
							type='password'
							placeholder='••••••••••••••'
							{...register('password')}
							errorMessage={errors.password?.message}
						/>
					</Box>

					<Box
						display='flex'
						justifyContent='space-between'
						alignItems='center'
						mt={8}
						mb={5}>
						<FormCheckbox
							name='remember'
							label='Remember for 30 days'
						/>

						<NavLink
							href='/auth/forgot-password'
							linkText='Forgot password?'
							prefetch
						/>
					</Box>

					<LoadingButton
						type='submit'
						loading={loading}
						disabled={!isValid}
						buttonText='Sign in'
						loadingText='Signing in...'
					/>
				</Box>
			</FormProvider>

			<Typography
				variant='body1'
				mt={50}>
				Don&apos;t have an account?{' '}
				<NavLink
					href='/auth/sign-up'
					linkText='Sign up'
					ml={1}
					display='inline-flex'
					prefetch
				/>
			</Typography>
		</AuthFormWrapper>
	);
}
