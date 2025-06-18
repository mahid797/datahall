import { SyntheticEvent, useState } from 'react';
import { FormProvider } from 'react-hook-form';

import {
	Box,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Skeleton,
	Typography,
} from '@mui/material';

import { CustomCheckbox, FormInput, LoadingButton } from '@/components';

import { useFormSubmission } from '@/hooks';
import { useCreateLinkMutation, useDocumentDetailQuery } from '@/hooks/data';
import { useCreateLinkForm } from '@/hooks/forms';

import CustomAccordion from './CustomAccordion';
import SendingAccordion from './SendingAccordion';
import SharingOptionsAccordion from './SharingOptionsAccordion';

interface CreateLinkProps {
	open: boolean;
	documentId: string;
	onClose: (action: string, createdLink?: string) => void;
}

export default function CreateLink({ open, documentId, onClose }: CreateLinkProps) {
	const { data: document, isPending: isDocumentLoading } = useDocumentDetailQuery(documentId);
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
			const payload = getPayload();
			const { link } = await createLink.mutateAsync({ documentId, payload });
			onClose('submitted', link.linkUrl);
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
		<Dialog
			open={open}
			onClose={() => onClose('cancelled')}
			component='form'
			onSubmit={handleSubmit}
			fullWidth
			maxWidth='sm'>
			<DialogTitle variant='h2'>
				Create new link
				<Typography
					my={4}
					component='div'
					display='flex'
					gap={5}
					alignItems='center'
					variant='body2'>
					Selected document:{' '}
					{isDocumentLoading ? (
						<Skeleton
							height='1.5rem'
							width='10rem'
							variant='text'
						/>
					) : (
						<Chip
							size='small'
							label={document?.fileName}
							sx={{
								backgroundColor: 'alert.info',
								borderRadius: 50,
								verticalAlign: 'baseline',
							}}
						/>
					)}
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
		</Dialog>
	);
}
