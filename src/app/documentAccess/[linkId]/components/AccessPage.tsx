'use client';

import { Container, Skeleton } from '@mui/material';
import { useEffect, useState } from 'react';

import AccessError from './AccessError';
import FileAccess from './FileDisplay';
import VisitorInfoModal from './VisitorInfoModal';

import { useDocumentAccess, useFormSubmission, useVisitorSubmission } from '@/hooks';
import { FileAccessPayload } from '@/shared/models';

interface Props {
	linkId: string;
}

export default function AccessPage({ linkId }: Props) {
	const [linkData, setLinkData] = useState<FileAccessPayload>({} as FileAccessPayload);
	const [fetchLinkError, setFetchLinkError] = useState('');
	const [hasInitialized, setHasInitialized] = useState(false); // This flag blocks the rendering of visitorInfoModal till the useEffect finishes to check whether a link url is truly public or not.

	const { error, data, isLoading } = useDocumentAccess(linkId);
	const linkInfo = {
		isPasswordProtected: false,
		visitorFields: [] as string[],
		signedUrl: undefined as string | undefined,
		...data?.data,
	};

	const { mutateAsync: submitVisitorData, isPending } = useVisitorSubmission();

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
				email: '',
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

		successMessage: 'File accessed successfully!',
		errorMessage: 'Error accessing the link. Please try again later.',
		onError: (errMsg) => {
			setFetchLinkError(errMsg);
		},
	});

	useEffect(() => {
		if (!isLoading && !hasInitialized) {
			const { isPasswordProtected, visitorFields, signedUrl } = linkInfo;
			const isTrulyPublic = !isPasswordProtected && visitorFields.length === 0;

			if (isTrulyPublic && !signedUrl) {
				handleSubmit({ preventDefault: () => {} } as any).finally(() => setHasInitialized(true));
			} else {
				setHasInitialized(true);
			}
		}
	}, [isLoading, hasInitialized, linkInfo, handleSubmit]);

	const handleVisitorModalSubmit = async (file: FileAccessPayload) => {
		setLinkData(file);
	};

	// ⏳ Still fetching or still waiting for useEffect decision logic
	if (isLoading || !hasInitialized || isPending)
		return (
			<Skeleton
				variant='rectangular'
				height={200}
			/>
		);

	if (fetchLinkError) return <AccessError message={fetchLinkError} />;

	if (linkData.signedUrl) {
		return (
			<FileAccess
				size={linkData.size || 0}
				fileName={linkData.fileName || 'Document'}
				fileType={linkData.fileType}
				signedUrl={linkData.signedUrl}
				documentId={linkData.documentId}
				documentLinkId={linkId}
			/>
		);
	}

	return (
		<Container>
			<VisitorInfoModal
				linkId={linkId}
				visitorFields={linkInfo.visitorFields}
				passwordRequired={linkInfo.isPasswordProtected}
				onVisitorInfoModalSubmit={handleVisitorModalSubmit}
			/>
		</Container>
	);
}
