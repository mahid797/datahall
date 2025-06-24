import { SyntheticEvent, useState } from 'react';
import { FormProvider } from 'react-hook-form';

import {
	Box,
	Chip,
	DialogActions,
	DialogContent,
	DialogTitle,
	Skeleton,
	Typography,
} from '@mui/material';

import AccordionContainer from './AccordionContainer';
import EmailOptionsAccordion from './EmailOptionsAccordion';
import AccessLinkConfiguration from './LinkSettingsAccordion';

import { FormCheckbox, FormInput, LoadingButton } from '@/components';

import { useCreateLinkMutation, useDocumentDetailQuery } from '@/hooks/data';
import { useCreateLinkForm, useFormSubmission } from '@/hooks/forms';

interface LinkCreateModalProps {
	documentId: string;
	onLinkGenerated?: (linkUrl: string) => void;
	closeModal: () => void;
}

export default function LinkCreateModal({
	documentId,
	onLinkGenerated,
	closeModal,
}: LinkCreateModalProps) {
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
			const { link } = await createLink.mutateAsync({
				documentId,
				payload: getPayload(),
			});
			onLinkGenerated?.(link.linkUrl);
		},
		successMessage: 'Link created successfully!',
		onError: (error) => {
			const message = error || 'Failed to create link. Please try again.';
			console.log(error);
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

							<FormCheckbox
								sx={{ mt: 6, ml: 2 }}
								name='isPublic'
								label='Allow anyone with this link to preview and download'
								onCheckedChange={toggleIsPublic}
							/>
						</Box>

						{/* Accordions */}
						<AccordionContainer
							title='Sharing options'
							expanded={expanded === 'sharing-options'}
							onChange={handleChange('sharing-options')}>
							<AccessLinkConfiguration />
						</AccordionContainer>

						<AccordionContainer
							title='Sending'
							expanded={expanded === 'sending'}
							onChange={handleChange('sending')}>
							<EmailOptionsAccordion />
						</AccordionContainer>
					</Box>
				</DialogContent>
			</FormProvider>

			<DialogActions sx={{ p: 16 }}>
				<LoadingButton
					type='submit'
					fullWidth
					loading={loading}
					disabled={!isValid}
					onClick={handleSubmit}
					buttonText='Generate'
					loadingText='Generating…'
				/>
			</DialogActions>
		</>
	);
}
