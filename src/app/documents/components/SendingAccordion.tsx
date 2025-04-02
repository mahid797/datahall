import React, { ChangeEvent, FocusEvent, useState } from 'react';

import { Autocomplete, Box, Chip } from '@mui/material';

import { CustomCheckbox, FormInput } from '@/components';
import { useFetchContacts } from '@/hooks';

import { LinkFormValues } from '@/shared/models';

interface SendingAccordionProps {
	formValues: any;
	handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
	handleBlur: (event: FocusEvent<HTMLInputElement>) => void;
	getError: (fieldName: keyof LinkFormValues) => string;
}

export default function SendingAccordion({
	formValues,
	handleInputChange,
	handleBlur,
	getError,
}: SendingAccordionProps) {
	const [selectedEmails, setSelectedEmails] = useState<{ label: string; id: number }[]>([]);
	const { data } = useFetchContacts();

	const handleContactEmailsChange = (
		event: React.SyntheticEvent,
		newValue: { id: number; label: string }[],
	) => {
		// Remove duplicates by converting to a Map (ensures unique IDs)
		const uniqueEmails = Array.from(new Map(newValue.map((item) => [item.id, item])).values());

		// Update selectedEmails state
		setSelectedEmails(uniqueEmails);

		// Convert selected emails into a comma-separated string
		const emailString = uniqueEmails.map((email) => email.label).join(', ');

		// Update formValues.contactEmails
		handleInputChange({
			target: {
				name: 'contactEmails',
				value: emailString,
			},
		} as unknown as ChangeEvent<HTMLInputElement>);
	};

	//Get filtered contact emails.
	const contactEmails =
		data
			?.map((contact, index) => ({
				label: contact.email ?? 'Unknown email',
				id: contact.id ?? index,
			}))
			?.filter((email) => !selectedEmails.some((selected) => selected.id === email.id)) ?? [];

	const disabled = formValues.isPublic;
	// If link is public => disable all these additional security checkboxes

	return (
		<Box py={4}>
			<CustomCheckbox
				checked={formValues.selectFromContact}
				onChange={handleInputChange}
				name='selectFromContact'
				label='Select from the contact list'
				disabled={disabled}
			/>
			<Box
				mt={3}
				mb={8}
				ml={13}>
				<Autocomplete
					multiple
					disablePortal
					id='contactEmails'
					options={contactEmails}
					value={selectedEmails}
					getOptionLabel={(option) => option.label}
					onChange={handleContactEmailsChange}
					disabled={!formValues.selectFromContact}
					renderTags={(value, getTagProps) =>
						value.map((option, index) => {
							const { key, ...restProps } = getTagProps({ index });
							return (
								<Chip
									key={key}
									label={option.label}
									{...restProps}
								/>
							);
						})
					}
					renderInput={(params) => (
						<FormInput
							{...params}
							id='searchContactEmails'
							placeholder='Search'
							autoComplete='off'
							inputProps={{
								...params.inputProps, // Keep MUI's default input props
								autoComplete: 'new-password', // Trick the browser to disable autofill
							}}
						/>
					)}
				/>
			</Box>

			<CustomCheckbox
				checked={formValues.sendToOthers}
				onChange={handleInputChange}
				name='sendToOthers'
				label='Send someone not in the contact list. Separate with commas.'
				disabled={disabled}
			/>
			<Box
				my={3}
				ml={13}>
				<FormInput
					id='otherEmails'
					type='text'
					value={formValues.otherEmails}
					placeholder='Enter emails, separated by commas'
					onChange={handleInputChange}
					onBlur={handleBlur}
					errorMessage={getError('otherEmails')}
					disabled={!formValues.sendToOthers}
					fullWidth
				/>
			</Box>
		</Box>
	);
}
