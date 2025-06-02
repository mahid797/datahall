'use client';

import React, { Fragment } from 'react';

import {
	Box,
	Dialog,
	DialogActions,
	DialogContent,
	Divider,
	IconButton,
	Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import { FormInput, LoadingButton } from '@/components';

import { useFormSubmission, useValidatedFormData, useVisitorSubmission } from '@/hooks';

import { EyeIcon, EyeOffIcon, FileDownloadIcon } from '@/icons';
import { visitorFieldsConfigByKey } from '@/shared/config/visitorFieldsConfig';
import { FileAccessPayload } from '@/shared/models';
import { requiredFieldRule, splitName, validEmailRule } from '@/shared/utils';

function getFormConfig(passwordRequired: boolean, visitorFields: string[]) {
	const formConfig: {
		initialValues: Record<string, string>;
		validationRules: Record<string, any[]>;
	} = {
		initialValues: {},
		validationRules: {},
	};

	if (passwordRequired) {
		formConfig.initialValues.password = '';
		formConfig.validationRules.password = [requiredFieldRule('This field is required')];
	}

	visitorFields.forEach((field) => {
		formConfig.initialValues[field] = '';
		const rules = [requiredFieldRule('This field is required')];

		if (field === 'email') {
			rules.push(validEmailRule);
		}

		formConfig.validationRules[field] = rules;
	});

	return formConfig;
}

interface VisitorInfoModalProps {
	linkId: string;
	passwordRequired: boolean;
	visitorFields: string[];
	onVisitorInfoModalSubmit: (data: FileAccessPayload) => void;
}

export default function VisitorInfoModal({
	linkId,
	passwordRequired,
	visitorFields,
	onVisitorInfoModalSubmit,
}: VisitorInfoModalProps) {
	const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
	const formConfig = getFormConfig(passwordRequired, visitorFields);

	const { values, handleChange, handleBlur, getError, validateAll } = useValidatedFormData({
		initialValues: formConfig.initialValues,
		validationRules: formConfig.validationRules,
	});

	const { mutateAsync: submitVisitorData, isPending } = useVisitorSubmission();

	const { loading, handleSubmit, toast } = useFormSubmission({
		onSubmit: async () => {
			const hasError = validateAll();
			if (hasError) {
				throw new Error('Please correct the highlighted fields.');
			}

			// HOTFIX: Untouched empty fields weren't being validated on first submit
			// Additional validation to catch empty required fields even if untouched
			// This is a temporary fix until we can refactor the validation logic with Zod
			const requiredFields = visitorFields.filter((field) =>
				formConfig.validationRules[field]?.some((rule) => rule.message.includes('required')),
			);

			const emptyFields = requiredFields.filter(
				(field) => !values[field] || values[field].trim() === '',
			);

			if (emptyFields.length > 0) {
				throw new Error('Please fill in all required fields.');
			}

			const splittedName = splitName(values.name);
			const payload = {
				linkId,
				firstName: splittedName.firstName,
				lastName: splittedName.lastName,
				email: values.email || '',
				password: values.password || '',
				visitorMetaData: null, // This will be populated to add any additional user information, Implementation from API endpoint as well.
			};

			const response = await submitVisitorData({ linkId, payload });

			if (!response.data) {
				throw new Error('No file data returned.');
			}

			onVisitorInfoModalSubmit(response.data);
		},

		successMessage: 'File access granted!',
	});

	return (
		<Dialog
			open
			onClose={() => {}}
			component='form'
			onSubmit={handleSubmit}
			fullWidth>
			{/* Header */}
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
					{visitorFields.map((field) => {
						const [fieldConfig] = visitorFieldsConfigByKey[field];

						if (!fieldConfig) return null;

						return (
							<Fragment key={field}>
								{/* Visitor fields, e.g., name and email */}
								<Grid size={3}>
									<Typography
										variant='h3'
										mt={field === 'password' ? 10 : 0}>
										{fieldConfig.label}
									</Typography>
								</Grid>
								<Grid size={passwordRequired ? 8 : 9}>
									<FormInput
										id={field}
										placeholder={fieldConfig.placeholder}
										value={values[field] || ''}
										onChange={handleChange}
										onBlur={handleBlur}
										errorMessage={getError(field)}
									/>
								</Grid>
							</Fragment>
						);
					})}

					{passwordRequired && (
						<>
							{/* Divider */}
							{visitorFields.length > 0 && (
								<Grid size={12}>
									<Divider sx={{ borderBottomWidth: 2 }} />
								</Grid>
							)}

							{/* Password */}
							<Grid
								size={3}
								pt={14}>
								<Typography variant='h3'>Password</Typography>
							</Grid>
							<Grid
								display='grid'
								rowGap={5}
								size={8}>
								<Typography variant='body1'>Please enter the password shared with you</Typography>
								<FormInput
									id='password'
									type={isPasswordVisible ? 'text' : 'password'}
									value={values.password || ''}
									onChange={handleChange}
									onBlur={handleBlur}
									errorMessage={getError('password')}
								/>
							</Grid>
							<Grid
								size={1}
								pt={14}>
								<IconButton onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
									{isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
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
					loading={loading || isPending}
					disabled={loading || isPending}
					buttonText='Confirm'
					loadingText='Confirming...'
					fullWidth
				/>
			</DialogActions>
		</Dialog>
	);
}
