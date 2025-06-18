import { SyntheticEvent } from 'react';

import { Autocomplete, Box, Chip } from '@mui/material';

import { CustomCheckbox, FormInput } from '@/components';

import { useContactsQuery } from '@/hooks/data';

import { DocumentLinkFormValues } from '@/shared/validation/documentLinkSchemas';
import { validateEmails } from '@/shared/validation/validationUtils';
import { Controller, useFormContext } from 'react-hook-form';

/**
 * “Sending” section — choose recipients for the link e-mail.
 * Reads and updates react-hook-form state directly via `useFormContext`.
 */
export default function SendingAccordion() {
	const {
		control,
		register,
		watch,
		setValue,
		formState: { errors },
	} = useFormContext<DocumentLinkFormValues>();

	const isPublicLink = watch('isPublic');
	const selectFromContact = watch('selectFromContact');
	const sendToOthers = watch('sendToOthers');

	const { data: contacts = [] } = useContactsQuery();

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

	return (
		<Box py={4}>
			<CustomCheckbox
				label='Select from the contact list'
				disabled={isPublicLink}
				{...register('selectFromContact')}
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
							disablePortal
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

			<CustomCheckbox
				label='Send to e-mails not in the contact list'
				disabled={isPublicLink}
				{...register('sendToOthers')}
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
