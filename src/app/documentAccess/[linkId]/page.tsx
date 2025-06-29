import { Metadata } from 'next';
import { Suspense } from 'react';

import AccessManager from './components/AccessManager';
import AccessSkeleton from './components/AccessSkeleton';

import { PublicLinkMetaResponse } from '@/shared/models';

/* ------------------------------------------------------------------ */
/*  Server-side fetch of link-meta                                    */
/* ------------------------------------------------------------------ */
async function fetchPublicLinkMeta(linkId: string) {
	try {
		const base = process.env.NEXT_PUBLIC_APP_URL!;
		const res = await fetch(`${base}/api/public_links/${linkId}`, {
			cache: 'no-store',
			next: { revalidate: 0 },
		});

		// invalid link etc.
		if (!res.ok) {
			console.error(`Failed to fetch link meta: ${res.status} ${res.statusText}`);
			return null;
		}

		const data = await res.json();

		// Type safety: check required fields
		if (
			!data ||
			typeof data !== 'object' ||
			typeof (data as any).data !== 'object' ||
			typeof (data as any).data.isPasswordProtected !== 'boolean'
		) {
			console.error('Invalid meta response:', data);
			return null;
		}

		return data as PublicLinkMetaResponse;
	} catch (err) {
		console.error('Error fetching link meta:', err);
		return null;
	}
}

export default async function LinkAccessPage({ params }: { params: Promise<{ linkId: string }> }) {
	const { linkId } = await params;
	const initialMeta = await fetchPublicLinkMeta(linkId);
	return (
		<Suspense fallback={<AccessSkeleton />}>
			<AccessManager
				linkId={linkId}
				initialMeta={initialMeta ?? undefined}
			/>
		</Suspense>
	);
}

export const metadata: Metadata = {
	title: 'File Share',
	description: 'Access a file shared with you via DataRoom',
};
