import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { Box, Chip, IconButton, MenuItem, Select, Typography } from '@mui/material';
import { MobileDateTimePicker } from '@mui/x-date-pickers';

import { EyeIcon, EyeOffIcon } from '@/icons';

import { FormCheckbox, FormInput } from '@/components';

import { useCreateLinkForm } from '@/hooks/forms';

import { visitorFieldsConfig } from '@/shared/config/visitorFieldsConfig';
import { sortFields } from '@/shared/utils';

export default function LinkSettingsAccordion() {
	const {
		control,
		register,
		watch,
		formState: { errors },
		updateVisitorFields,
		setExpirationTime,
	} = useFormContext() as ReturnType<typeof useCreateLinkForm>;

	const [showPassword, setShowPassword] = useState(false);

	const isPublic = useWatch({ name: 'isPublic' });
	const askUserDetails = useWatch({ name: 'requireUserDetails' });
	const needPassword = useWatch({ name: 'requirePassword' });
	const enableExpiry = useWatch({ name: 'expirationEnabled' });

	return (
		<Box
			py={2}
			display={'flex'}
			flexDirection={'column'}>
			<FormCheckbox
				name='requireUserDetails'
				label='Ask for the following to view and download the document'
				disabledWhen={() => isPublic}
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
								sx={{ minWidth: 475 }}
								disabled={!askUserDetails}
								{...field}
								onChange={(e) => updateVisitorFields(e.target.value as string[])}
								renderValue={(selected) => {
									const sortedSelected = sortFields(selected, [...visitorFieldsConfig]);
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

			<FormCheckbox
				name='requirePassword'
				label='Require a password to access'
				disabledWhen={() => isPublic}
				clearOnFalse={['password']}
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

			<FormCheckbox
				name='expirationEnabled'
				label='Expiration'
				disabledWhen={() => isPublic}
				clearOnFalse={['expirationTime']}
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
				ml={14}
				mr={20}
				mb={10}>
				<Controller
					control={control}
					name='expirationTime'
					render={({ field }) => (
						<MobileDateTimePicker
							minDateTime={dayjs()}
							slotProps={{
								toolbar: { hidden: true },
								textField: { fullWidth: true, size: 'small' },
							}}
							disabled={!enableExpiry}
							value={field.value ? dayjs.utc(field.value).local() : null}
							onChange={(d) => setExpirationTime(d ? dayjs.utc(d).toISOString() : '')}
						/>
					)}
				/>
			</Box>
		</Box>
	);
}
