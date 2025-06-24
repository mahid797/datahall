import { SyntheticEvent } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { Autocomplete, Box, Chip, Skeleton } from '@mui/material';

import { FormCheckbox, FormInput } from '@/components';

import { useContactsQuery } from '@/hooks/data';

import { DocumentLinkFormValues } from '@/shared/validation/documentLinkSchemas';
import { validateEmails } from '@/shared/validation/validationUtils';

/**
 * “Sending” section — choose recipients for the link e-mail.
 * Reads and updates react-hook-form state directly via `useFormContext`.
 */
export default function EmailOptionsAccordion() {
	const {
		control,
		register,
		watch,
		setValue,
		formState: { errors },
	} = useFormContext<DocumentLinkFormValues>();

	const isPublicLink = useWatch({ name: 'isPublic' });
	const selectFromContact = useWatch({ name: 'selectFromContact' });
	const sendToOthers = useWatch({ name: 'sendToOthers' });

	const { data: contacts = [], isLoading } = useContactsQuery();

	const contactOptions = contacts
		.filter((contact) => contact.email)
		.map((contact, index) => ({
			id: contact.id ?? index,
			label: contact.email as string,
		}));

	const handleContactEmailsChange = (
		event: SyntheticEvent,
		newSelection: { id?: number; label: string }[],
		onChange: (value: unknown) => void,
	) => {
		const uniqueSelection = Array.from(
			new Map(newSelection.map((item) => [item.id, item])).values(),
		);
		onChange(uniqueSelection);
	};

	const sanitizeOtherEmails = (emails: string) => {
		const { validEmails } = validateEmails(emails);
		setValue('otherEmails', validEmails.join(', '), { shouldValidate: true });
	};

	const LoadingSkeleton = () => (
		<Box
			display='flex'
			flexDirection='column'
			gap={2}>
			{[...Array(4)].map((_, idx) => (
				<Skeleton
					key={idx}
					variant='text'
					height={24}
				/>
			))}
		</Box>
	);

	return (
		<Box py={4}>
			<FormCheckbox
				name='selectFromContact'
				label='Select from the contact list'
				disabledWhen={() => isPublicLink}
				clearOnFalse={['contactEmails']}
			/>

			<Box
				mt={3}
				mb={8}
				ml={13}>
				<Controller
					control={control}
					name='contactEmails'
					render={({ field: { value, onChange } }) => (
						<Autocomplete
							multiple
							disablePortal={false}
							loading={isLoading}
							loadingText={<LoadingSkeleton />}
							options={contactOptions.filter(
								(option) => !value.some((selected) => selected.id === option.id),
							)}
							value={value}
							getOptionLabel={(option) => option.label}
							disabled={!selectFromContact || isPublicLink}
							onChange={(event, newValue) => handleContactEmailsChange(event, newValue, onChange)}
							renderTags={(tagValue, getTagProps) =>
								tagValue.map((option, index) => {
									const { key, ...restProps } = getTagProps({ index });
									return (
										<Chip
											key={key}
											label={option.label}
											{...restProps}
											size='small'
										/>
									);
								})
							}
							renderInput={(params) => (
								<FormInput
									{...params}
									id='searchContactEmails'
									placeholder='Search contacts'
									autoComplete='off'
									slotProps={{ input: { autoComplete: 'new-password' } }}
								/>
							)}
						/>
					)}
				/>
			</Box>

			<FormCheckbox
				name='sendToOthers'
				label='Send to e-mails not in the contact list'
				disabledWhen={() => isPublicLink}
				clearOnFalse={['otherEmails']}
			/>

			<Box
				my={3}
				ml={13}>
				<FormInput
					id='otherEmails'
					type='text'
					placeholder='Enter e-mails, separated by commas'
					fullWidth
					disabled={!sendToOthers || isPublicLink}
					{...register('otherEmails')}
					errorMessage={errors.otherEmails?.message as string}
					onBlur={(event) => sanitizeOtherEmails(event.target.value)}
				/>
			</Box>
		</Box>
	);
}
