import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/queryKeys';
import { PublicLinkMetaResponse } from '@/shared/models';

/**
 * Fetches visitor-side meta for a public link.
 *
 *   GET /api/public_links/[linkId]
 *
 * Caches for 1 min; no retries (invalid links shouldn’t loop).
 */
const usePublicLinkMeta = (linkId: string, initialData?: PublicLinkMetaResponse) =>
	useQuery({
		queryKey: queryKeys.links.meta(linkId),
		queryFn: async () => {
			const { data } = await axios.get<PublicLinkMetaResponse>(`/api/public_links/${linkId}`);
			return data;
		},
		staleTime: 60_000,
		retry: false,
		initialData,
	});

export default usePublicLinkMeta;
