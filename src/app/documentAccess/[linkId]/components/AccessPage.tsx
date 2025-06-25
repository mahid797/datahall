'use client';

import { Box, Container, Skeleton, Stack } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';

import AccessError from './AccessError';
import FileDisplay from './FileDisplay';

import { useCreateLinkVisitorMutation, useDocumentAccessQuery } from '@/hooks/data';
import { useFormSubmission } from '@/hooks/forms';

import { useModalContext } from '@/providers/modal/ModalProvider';
import { PublicLinkFilePayload } from '@/shared/models';

interface Props {
	linkId: string;
}

/**
 * @deprecated
 * This function is deprecated and will be removed in future versions.
 */
function AccessSkeleton() {
	return (
		<Stack
			spacing={4}
			alignItems='center'>
			<Skeleton
				variant='rectangular'
				width={225}
				height={24}
			/>
			<Skeleton
				variant='rectangular'
				width={400}
				height={20}
			/>
			<Skeleton
				variant='rectangular'
				width={350}
				height={35}
			/>
			<Box
				display='flex'
				alignItems='center'
				pt={24}
				gap={32}>
				<Skeleton
					variant='rectangular'
					width={150}
					height={40}
				/>
				<Skeleton
					variant='rectangular'
					width={150}
					height={40}
				/>
			</Box>
		</Stack>
	);
}

/**
 * @deprecated
 * This component is deprecated and will be removed in future versions.
 */
export default function AccessPage({ linkId }: Props) {
	const [linkData, setLinkData] = useState<PublicLinkFilePayload>({} as PublicLinkFilePayload);
	const [fetchLinkError, setFetchLinkError] = useState('');
	const [hasInitialized, setHasInitialized] = useState(false); // This flag blocks the rendering of visitorInfoModal till the useEffect finishes to check whether a link url is truly public or not.

	const gateOpenedRef = useRef(false);
	const autoRequestSent = useRef(false);
	const { openModal } = useModalContext();
	const { error, data, isLoading } = useDocumentAccessQuery(linkId);
	const linkInfo = useMemo(
		() => ({
			isPasswordProtected: false,
			visitorFields: [] as string[],
			signedUrl: undefined as string | undefined,
			...data?.data,
		}),
		[data],
	);

	const { mutateAsync: submitVisitorData, isPending } = useCreateLinkVisitorMutation();

	useEffect(() => {
		if (error) {
			setFetchLinkError(error.message);
			setHasInitialized(true);
		}
	}, [error]);

	const { handleSubmit } = useFormSubmission({
		onSubmit: async () => {
			const payload = {
				linkId,
				firstName: '',
				lastName: '',
				password: '',
			};

			const response = await submitVisitorData({ linkId, payload });
			const file = response.data;

			setLinkData({
				signedUrl: file.signedUrl,
				fileName: file.fileName,
				size: file.size,
				fileType: file.fileType,
				documentId: file.documentId,
			});
		},
		successMessage: 'File accessed successfully....!',
		errorMessage: 'Error accessing the link. Please try again later.',
		onError: (errMsg) => {
			setFetchLinkError(errMsg);
		},
	});

	useEffect(() => {
		if (!isLoading && !hasInitialized) {
			const { isPasswordProtected, visitorFields, signedUrl } = linkInfo;
			const isTrulyPublic = !isPasswordProtected && visitorFields.length === 0;

			if (isTrulyPublic && !signedUrl && !autoRequestSent.current) {
				autoRequestSent.current = true;
				handleSubmit({ preventDefault: () => {} } as any).finally(() => {
					setHasInitialized(true);
				});
			} else {
				setHasInitialized(true);
				/* ── gated link → open modal once ─────────────────────────── */
				if (!isTrulyPublic && !gateOpenedRef.current) {
					gateOpenedRef.current = true;
					openModal({
						type: 'documentAccess',
						dialogProps: {
							disableEscapeKeyDown: isPasswordProtected,
							disableBackdropClick: isPasswordProtected,
						},
						contentProps: {
							linkId,
							passwordRequired: isPasswordProtected,
							visitorFields,
							onSubmitSuccess: handleVisitorModalSubmit,
						},
					});
				}
			}
		}
	}, [isLoading, hasInitialized, linkInfo, handleSubmit]);

	const handleVisitorModalSubmit = (file: PublicLinkFilePayload) => setLinkData(file);

	// ⏳  Still fetching or waiting for decision logic / modal submission
	if (isLoading || !hasInitialized || isPending) return <AccessSkeleton />;

	if (fetchLinkError) return <AccessError message={fetchLinkError} />;

	if (linkData.signedUrl) {
		return (
			<FileDisplay
				size={linkData.size || 0}
				fileName={linkData.fileName || 'Document'}
				fileType={linkData.fileType}
				signedUrl={linkData.signedUrl}
				documentId={linkData.documentId}
				documentLinkId={linkId}
			/>
		);
	}

	return <Container />;
}
