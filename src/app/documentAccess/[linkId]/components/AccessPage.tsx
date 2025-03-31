'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';

import { Container } from '@mui/material';

import VisitorInfoModal from './VisitorInfoModal';
import AccessError from './AccessError';
import FileAccess from './FileDisplay';

import { LoadingSpinner } from '@/components';
import { LinkData } from '@/shared/models';
import { useFormSubmission, useToast, useDocumentAccess } from '@/hooks';

interface Props {
	linkId: string;
}

function sortVisitorFields(fields: string[]): string[] {
	const order = ['name', 'email', 'password'];
	return fields.sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

export default function AccessPage({ linkId }: Props) {
	const [linkData, setLinkData] = useState<LinkData>({});
	const [fetchLinkError, setFetchLinkError] = useState<string>('');
	const [hasInitialized, setHasInitialized] = useState(false);

	const toast = useToast();
	const { error, data, isLoading } = useDocumentAccess(linkId);
	const linkInfo = data?.data ?? {};

	const { handleSubmit } = useFormSubmission({
		onSubmit: async () => {
			if (!linkId) throw new Error('Missing linkId.');

			const payload = {
				linkId,
				firstName: '',
				lastName: '',
				email: '',
				password: '',
			};

			const response = await axios.post(`/api/public_links/${linkId}/access`, payload);
			if (!response?.data?.data) {
				throw new Error(response.data?.message || 'Unable to access file.');
			}

			setLinkData({
				signedUrl: response.data.data.signedUrl,
				fileName: response.data.data.fileName,
				size: response.data.data.size,
			});
		},

		successMessage: 'File accessed successfully!',
		errorMessage: 'Error accessing the link. Please try again later.',
		onError: (errMsg) => {
			setFetchLinkError(errMsg);
		},
	});

	useEffect(() => {
		if (!isLoading && data?.data && !hasInitialized) {
			const { isPasswordProtected, visitorFields, signedUrl } = linkInfo;
			const isTrulyPublic = !isPasswordProtected && visitorFields.length === 0;

			if (isTrulyPublic && !signedUrl) {
				handleSubmit({ preventDefault: () => {} } as any).finally(() => {
					setHasInitialized(true);
				});
			} else {
				setHasInitialized(true);
			}
		}
	}, [isLoading, data, hasInitialized]);

	const handleVisitorInfoFormModalSubmit = (data: { [key: string]: any }) => {
		setLinkData({
			signedUrl: data.signedUrl,
			fileName: data.fileName,
			size: data.size,
		});
	};

	// ⏳ Still fetching or still waiting for useEffect decision logic
	if (isLoading || !hasInitialized) {
		return <LoadingSpinner />;
	}

	if (fetchLinkError) {
		return <AccessError message={fetchLinkError} />;
	}

	if (linkData.signedUrl) {
		return (
			<FileAccess
				size={linkData.size || 0}
				fileName={linkData.fileName || 'Document'}
				signedUrl={linkData.signedUrl}
			/>
		);
	}

	return (
		<Container>
			<VisitorInfoModal
				linkId={linkId}
				visitorFields={sortVisitorFields(linkInfo.visitorFields || [])}
				passwordRequired={linkInfo.isPasswordProtected}
				onVisitorInfoModalSubmit={handleVisitorInfoFormModalSubmit}
			/>
		</Container>
	);
}
