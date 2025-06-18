import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { queryKeys } from '@/shared/queryKeys';
import type { Contact } from '@/shared/models';

/** All visitors across all links of a document. */
const useDocumentVisitorsQuery = (documentId: string) =>
	useQuery({
		queryKey: queryKeys.documents.visitors(documentId),
		enabled: !!documentId,
		queryFn: async (): Promise<Contact[]> => {
			const { data } = await axios.get<{ visitors: Contact[] }>(
				`/api/documents/${documentId}/visitors`,
			);
			return data.visitors;
		},
		staleTime: 30_000,
	});

export default useDocumentVisitorsQuery;
