import { useCallback, useEffect, useRef, useState } from 'react';

import usePublicLinkMeta from './usePublicLinkMeta';

import { useModalContext } from '@/providers/modal/ModalProvider';
import type { PublicLinkFilePayload, PublicLinkMetaResponse } from '@/shared/models';

export type LinkAccessState = 'loading' | 'gate' | 'file' | 'error';

interface UseLinkAccessResult {
	state: LinkAccessState;
	fileData: PublicLinkFilePayload | null;
	retry: () => void;
}

/**
 * Central orchestrator for visitor-side access:
 *   1. fetch link meta
 *   2. auto-access if truly public
 *   3. open gate modal when needed
 */
const useLinkAccess = (
	linkId: string,
	initialMeta?: PublicLinkMetaResponse,
): UseLinkAccessResult => {
	const { data: linkMetaData, error, refetch, isFetching } = usePublicLinkMeta(linkId, initialMeta);

	const { openModal } = useModalContext();

	const [fileData, setFileData] = useState<PublicLinkFilePayload | null>(null);
	const [errorFlag, setErrorFlag] = useState(false);

	const modalOpened = useRef(false);

	/* ---------- handle meta state ---------- */
	useEffect(() => {
		if (error) return; // error handled below

		if (!linkMetaData) return; // still fetching

		const { isPasswordProtected, visitorFields, signedUrl } = linkMetaData.data;

		const meta = linkMetaData.data;

		// PUBLIC link with no gate → fetch file automatically
		if (!isPasswordProtected && visitorFields.length === 0) {
			if (signedUrl) {
				setFileData({
					signedUrl,
					fileName: meta.fileName ?? 'Document',
					size: meta.size ?? 0,
					fileType: meta.fileType ?? '',
					documentId: meta.documentId ?? '',
				});
			} else {
				console.error('Public‐link access error');
				setErrorFlag(true);
			}

			return;
		}

		// Not public → open modal once
		if (!modalOpened.current) {
			modalOpened.current = true;
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
					onSubmitSuccess: (file: PublicLinkFilePayload) => {
						setFileData(file);
					},
				},
			});
		}
	}, [linkMetaData, error, openModal, linkId]);

	/* ---------- state derivation ---------- */
	let state: LinkAccessState = 'loading';
	if (error || errorFlag) state = 'error';
	else if (fileData) state = 'file';
	else if (modalOpened.current) state = 'gate';
	else if (!isFetching && linkMetaData) state = 'error'; // fallback

	const retry = useCallback(() => {
		setFileData(null);
		modalOpened.current = false;
		refetch();
	}, [refetch]);

	return { state, fileData, retry };
};

export default useLinkAccess;
