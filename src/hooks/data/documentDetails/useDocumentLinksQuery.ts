import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { queryKeys } from '@/shared/queryKeys';
import type { LinkDetailRow } from '@/shared/models';

/**
 * Owner-side list of links for one document.
 * Pagination TBD – for now returns full list.
 */
const useDocumentLinksQuery = (documentId: string) =>
	useQuery({
		queryKey: queryKeys.documents.links(documentId),
		enabled: !!documentId,
		queryFn: async (): Promise<LinkDetailRow[]> => {
			const { data } = await axios.get<{ links: LinkDetailRow[] }>(
				`/api/documents/${documentId}/links`,
			);
			return data.links;
		},
		staleTime: 30_000,
	});

export default useDocumentLinksQuery;
