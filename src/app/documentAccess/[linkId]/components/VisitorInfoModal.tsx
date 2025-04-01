'use client';

import React from 'react';

import {
	Box,
	Dialog,
	DialogActions,
	DialogContent,
	Divider,
	IconButton,
	Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { FormInput, LoadingButton } from '@/components';

import { useFormSubmission, useValidatedFormData, useVisitorSubmission } from '@/hooks';

import { EyeIcon, EyeOffIcon, FileDownloadIcon } from '@/icons';
import { requiredFieldRule, splitName, validEmailRule } from '@/shared/utils';
import { visitorFieldsConfig } from '@/shared/config/visitorFieldsConfig';

const RowBox = styled(Box)({
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	gap: 10,
	width: '100%',
	'& > h3': {
		flex: 2,
	},
	'& > div:nth-of-type(1)': {
		flex: 8,
	},
	'& > div:nth-of-type(2)': {
		marginLeft: 0,
		flex: 1,
	},
});

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
		formConfig.validationRules.password = [requiredFieldRule('*This field is required')];
	}

	visitorFields.forEach((field) => {
		formConfig.initialValues[field] = '';
		const rules = [requiredFieldRule('*This field is required')];

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
	onVisitorInfoModalSubmit: (data: Record<string, any>) => void;
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
	const submitVisitorData = useVisitorSubmission();

	const { loading, handleSubmit, toast } = useFormSubmission({
		onSubmit: async () => {
			const hasError = validateAll();
			if (hasError) {
				throw new Error('Please correct the highlighted fields.');
			}

			const splittedName = splitName(values.name);

			const payload = {
				linkId,
				firstName: splittedName.first_name,
				lastName: splittedName.last_name,
				email: values.email || '',
				password: values.password || '',
			};

			const response = await submitVisitorData.mutateAsync({ linkId, payload });

			if (!response.data) {
				throw new Error(response.data.message || 'No file data returned.');
			}

			onVisitorInfoModalSubmit(response.data);
		},

		successMessage: 'File access granted!',
	});

	return (
		<Dialog
			open
			onClose={() => {}}
			PaperProps={{
				component: 'form',
				onSubmit: handleSubmit,
				sx: { minWidth: 600, p: 0 },
			}}>
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
			<DialogContent sx={{ m: 12 }}>
				<Box
					display='flex'
					flexDirection='column'
					width='100%'
					gap={10}>
					{visitorFields.map((field) => {
						const fieldConfig = visitorFieldsConfig[field];

						if (!fieldConfig) return null;

						return (
							<RowBox key={field}>
								<Typography
									variant='h3'
									mt={field === 'password' ? 10 : 0}>
									{fieldConfig.label}
								</Typography>
								{field === 'password' ? (
									<Box sx={{ display: 'flex' }}>
										<Box sx={{ flex: 1 }}>
											<FormInput
												id='password'
												type={isPasswordVisible ? 'text' : 'password'}
												placeholder={fieldConfig.placeholder}
												label={fieldConfig.helperText}
												value={values.password || ''}
												onChange={handleChange}
												onBlur={handleBlur}
												errorMessage={getError('password')}
											/>
										</Box>
										<Box
											display={'flex'}
											mt={10}>
											<IconButton
												size='large'
												onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
												{isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
											</IconButton>
										</Box>
									</Box>
								) : (
									<FormInput
										id={field}
										type={fieldConfig.type}
										placeholder={fieldConfig.placeholder}
										value={values[field] || ''}
										onChange={handleChange}
										onBlur={handleBlur}
										errorMessage={getError(field)}
									/>
								)}
							</RowBox>
						);
					})}
				</Box>
			</DialogContent>

			<Divider />

			{/* Submit Button */}
			<DialogActions sx={{ p: 0, m: 12 }}>
				<LoadingButton
					loading={loading}
					buttonText='Confirm'
					loadingText='Confirming...'
					fullWidth
					type='submit'
				/>
			</DialogActions>
		</Dialog>
	);
}
