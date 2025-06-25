'use client';

import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { FormProvider } from 'react-hook-form';

import { BlueWaveLogo, FormInput, LoadingButton, NavLink, PasswordValidation } from '@/components';
import AuthFormWrapper from '../components/AuthFormWrapper';

import { useSignUpMutation } from '@/hooks/data';
import { useFormSubmission, useSignUpForm } from '@/hooks/forms';

export default function SignUp() {
	const router = useRouter();
	const registerMutation = useSignUpMutation();
	const form = useSignUpForm();

	/* ------------------------------ form state ----------------------------- */
	const {
		register,
		watch,
		formState: { errors, isValid, touchedFields },
	} = form;

	const { loading, handleSubmit, toast } = useFormSubmission({
		mutation: registerMutation,
		getVariables: () => form.getValues(),
		validate: () => isValid,
		successMessage: 'Verification e-mail sent — check your inbox!',
		onSuccess: () => {
			const msg = registerMutation.data?.message ?? 'Verification e-mail sent. Check your inbox.';
			toast.showToast({ message: msg, variant: 'success' });
			router.push('/auth/sign-in?emailSent=true');
		},

		onError: (err) => {
			const message = (err as any)?.response?.data?.message ?? 'Unable to create account';
			toast.showToast({ message, variant: 'error' });
		},
		skipDefaultToast: true,
	});

	return (
		<AuthFormWrapper>
			<Box mb={{ sm: 8, md: 12, lg: 20 }}>
				<BlueWaveLogo
					width={248}
					height={64}
				/>
			</Box>

			<Typography
				variant='h2'
				mb={{ sm: 10, md: 11, lg: 12 }}>
				Create an account
			</Typography>
			<FormProvider {...form}>
				<Box
					component='form'
					onSubmit={handleSubmit}
					noValidate
					minWidth={400}
					display='flex'
					flexDirection='column'
					gap={8}>
					<Box
						display='flex'
						gap={{ sm: 8, md: 9, lg: 10 }}
						flexDirection='column'>
						<FormInput
							label='First name'
							placeholder='Enter your first name'
							{...register('firstName')}
							errorMessage={errors.firstName?.message}
						/>

						<FormInput
							label='Last name'
							placeholder='Enter your last name'
							{...register('lastName')}
							errorMessage={errors.lastName?.message}
						/>

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
							placeholder='Create a password'
							{...register('password')}
							errorMessage={errors.password?.message}
						/>

						<FormInput
							label='Confirm password'
							type='password'
							placeholder='Confirm your password'
							{...register('confirmPassword')}
							errorMessage={errors.confirmPassword?.message}
						/>
					</Box>

					{/* Real-time password strength feedback */}
					<PasswordValidation
						passwordValue={watch('password')}
						isBlur={!!touchedFields.password}
					/>

					<LoadingButton
						type='submit'
						loading={loading}
						disabled={!isValid}
						buttonText='Get started'
						loadingText='Creating account...'
					/>
				</Box>
			</FormProvider>

			<Box
				mt={25}
				display='flex'
				justifyContent='center'
				flexDirection='column'
				alignItems='center'
				gap={8}>
				<NavLink
					href='/auth/sign-in'
					linkText='← Back to sign in'
					prefetch
				/>
			</Box>
		</AuthFormWrapper>
	);
}
