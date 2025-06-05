import dayjs from 'dayjs';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { Box, Chip, IconButton, MenuItem, Select, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import { EyeIcon, EyeOffIcon } from '@/icons';

import { CustomCheckbox, FormInput } from '@/components';

import { useCreateLinkForm } from '@/hooks/forms';

import { visitorFieldsConfig } from '@/shared/config/visitorFieldsConfig';
import { sortFields } from '@/shared/utils';
import { DocumentLinkFormValues } from '@/shared/validation/documentLinkSchemas';

export default function SharingOptionsAccordion() {
	const {
		control,
		register,
		watch,
		formState: { errors },
		updateVisitorFields,
		setExpirationTime,
	} = useFormContext() as ReturnType<typeof useCreateLinkForm>;

	const [showPassword, setShowPassword] = useState(false);

	const isPublic = watch('isPublic');
	const askUserDetails = watch('requireUserDetails');
	const needPassword = watch('requirePassword');
	const enableExpiry = watch('expirationEnabled');

	return (
		<Box
			py={2}
			display={'flex'}
			flexDirection={'column'}>
			<CustomCheckbox
				disabled={isPublic}
				{...register('requireUserDetails')}
				label='Ask for the following to view and download the document'
			/>

			<Box
				display='flex'
				flexDirection='column'>
				<Typography variant='body2'>Select required visitor details:</Typography>
				<Box
					ml={14}
					mt={5}
					mb={8}>
					<Controller
						control={control}
						name='visitorFields'
						render={({ field }) => (
							<Select
								multiple
								size='small'
								sx={{ minWidth: 455 }}
								disabled={!askUserDetails}
								{...field}
								onChange={(e) => updateVisitorFields(e.target.value as string[])}
								renderValue={(selected) => {
									const sortedSelected = sortFields(selected, visitorFieldsConfig);
									return (
										<Box
											display='flex'
											gap={2}>
											{sortedSelected.map((key) => {
												const field = visitorFieldsConfig.find((f) => f.key === key);
												return (
													<Chip
														key={key}
														label={field?.label || key}
														sx={{ px: '0.8rem' }}
														size='small'
													/>
												);
											})}
										</Box>
									);
								}}>
								{visitorFieldsConfig.map(({ key, label }) => (
									<MenuItem
										key={key}
										value={key}>
										{label}
									</MenuItem>
								))}
							</Select>
						)}
					/>
				</Box>
			</Box>
			<CustomCheckbox
				label='Require a password to access'
				disabled={isPublic}
				{...register('requirePassword')}
			/>

			<Box
				display='flex'
				alignItems='center'
				ml={14}
				mb={6}>
				<FormInput
					id='password'
					placeholder='Enter password'
					type={showPassword ? 'text' : 'password'}
					disabled={!needPassword}
					minWidth={455}
					{...register('password')}
					errorMessage={errors.password?.message as string}
				/>
				<IconButton
					sx={{ ml: 4 }}
					onClick={() => setShowPassword((p) => !p)}>
					{showPassword ? <EyeOffIcon /> : <EyeIcon />}
				</IconButton>
			</Box>

			{/* Expiration */}
			<CustomCheckbox
				label='Expiration'
				disabled={isPublic}
				{...register('expirationEnabled')}
			/>
			<Typography
				variant='body2'
				mb={3}>
				Link won&apos;t be visible after a certain day or a certain date.
			</Typography>

			<Box
				display='flex'
				alignItems='center'
				gap={2}
				ml={7.5}
				mb={10}>
				<Controller
					control={control}
					name='expirationTime'
					render={({ field }) => (
						<DateTimePicker
							slotProps={{ textField: { fullWidth: true, size: 'small' } }}
							disabled={!enableExpiry}
							value={field.value ? dayjs(field.value) : null}
							onChange={(d) => setExpirationTime(d ? d.toISOString() : '')}
						/>
					)}
				/>
			</Box>
		</Box>
	);
}
