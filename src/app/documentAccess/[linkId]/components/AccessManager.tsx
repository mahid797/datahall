'use client';

import AccessError from './AccessError';
import AccessSkeleton from './AccessSkeleton';
import FileDisplay from './FileDisplay';

import useLinkAccess from '@/hooks/data/documentAccess/useLinkAccess';

import { PublicLinkMetaResponse } from '@/shared/models';

interface AccessManagerProps {
	linkId: string;
	initialMeta?: PublicLinkMetaResponse;
}

/**
 * Top-level orchestrator – decides which visual state to render
 * based on the state-machine returned by `useLinkAccess`.
 */
export default function AccessManager({ linkId, initialMeta }: AccessManagerProps) {
	const { state, fileData, retry } = useLinkAccess(linkId, initialMeta);

	if (state === 'loading') return <AccessSkeleton />;

	if (state === 'error')
		return (
			<AccessError
				message='Something went wrong.'
				onRetry={retry}
			/>
		);

	if (state === 'file' && fileData) {
		return (
			<FileDisplay
				{...fileData}
				documentLinkId={linkId}
			/>
		);
	}

	/* state === 'gate' → modal is already open, nothing to render here */
	return null;
}
