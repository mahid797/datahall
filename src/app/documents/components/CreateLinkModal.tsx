import { SyntheticEvent, useState } from 'react';
import { FormProvider } from 'react-hook-form';

import { Box, Chip, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

import CustomAccordion from './CustomAccordion';
import SendingAccordion from './SendingAccordion';
import SharingOptionsAccordion from './SharingOptionsAccordion';

import { CustomCheckbox, FormInput, LoadingButton } from '@/components';

import { useDocumentDetail, useFormSubmission } from '@/hooks';
import { useCreateLinkMutation } from '@/hooks/data';
import { useCreateLinkForm } from '@/hooks/forms';

interface CreateLinkModalProps {
	documentId: string;
	onLinkGenerated?: (linkUrl: string) => void;
	closeModal: () => void;
}

export default function CreateLinkModal({
	documentId,
	onLinkGenerated,
	closeModal,
}: CreateLinkModalProps) {
	const document = useDocumentDetail(documentId);
	const createLink = useCreateLinkMutation();
	const form = useCreateLinkForm();

	const {
		register,
		formState: { errors, isValid },
		getPayload,
		toggleIsPublic,
	} = form;

	const { loading, handleSubmit, toast } = useFormSubmission({
		validate: () => isValid,
		onSubmit: async () => {
			const { link } = await createLink.mutateAsync({
				documentId,
				payload: getPayload(),
			});

			onLinkGenerated?.(link.linkUrl);
			closeModal();
		},
		successMessage: 'Link created successfully!',
		onError: (error) => {
			const message =
				(error as any)?.response?.data?.message || 'Failed to create link. Please try again.';
			toast.showToast({
				message,
				variant: 'error',
			});
		},
		skipDefaultToast: true,
	});

	const [expanded, setExpanded] = useState<string | false>('');
	const handleChange = (panel: string) => (event: SyntheticEvent, newExpanded: boolean) => {
		setExpanded(newExpanded ? panel : false);
	};

	return (
		<>
			<DialogTitle variant='h2'>
				Create new link
				<Typography
					my={4}
					component='div'
					variant='body2'>
					Selected document:{' '}
					<Chip
						size='small'
						label={document.document?.fileName}
						sx={{
							backgroundColor: 'alert.info',
							borderRadius: 50,
							verticalAlign: 'baseline',
						}}
					/>
				</Typography>
			</DialogTitle>

			<FormProvider {...form}>
				<DialogContent sx={{ overflowY: 'auto' }}>
					<Box
						display='flex'
						flexDirection='column'
						gap={2}>
						<Box>
							<FormInput
								label='Link alias'
								minWidth={460}
								{...register('alias')}
								errorMessage={errors.alias?.message as string}
								placeholder='Enter alias'
							/>

							<CustomCheckbox
								sx={{ mt: 6, ml: 2 }}
								label='Allow anyone with this link to preview and download'
								{...register('isPublic')}
								onChange={(e) => toggleIsPublic(e.target.checked)}
							/>
						</Box>

						{/* Accordions */}
						<CustomAccordion
							title='Sharing options'
							expanded={expanded === 'sharing-options'}
							onChange={handleChange('sharing-options')}>
							<SharingOptionsAccordion />
						</CustomAccordion>

						<CustomAccordion
							title='Sending'
							expanded={expanded === 'sending'}
							onChange={handleChange('sending')}>
							<SendingAccordion />
						</CustomAccordion>
					</Box>
				</DialogContent>
			</FormProvider>

			<DialogActions sx={{ p: 16 }}>
				<LoadingButton
					type='submit'
					fullWidth
					loading={loading}
					disabled={!isValid}
					buttonText='Generate'
					loadingText='Generating…'
				/>
			</DialogActions>
		</>
	);
}
