import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { queryKeys } from '@/shared/queryKeys';
import type { DocumentType } from '@/shared/models';

/**
 * Fetch a single document (metadata only) owned by the authenticated user.
 * Uses canonical query-key: ['documents', id]
 */
const useDocumentDetailQuery = (documentId: string) => {
	const fetcher = async (): Promise<DocumentType> => {
		const { data } = await axios.get<{ document: DocumentType }>(`/api/documents/${documentId}`);
		return data.document;
	};

	return useQuery<DocumentType, Error, DocumentType>({
		queryKey: queryKeys.documents.detail(documentId),
		queryFn: fetcher,
		enabled: !!documentId,
		staleTime: 60_000,
	});
};

export default useDocumentDetailQuery;
