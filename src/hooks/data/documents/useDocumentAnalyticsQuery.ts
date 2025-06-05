import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { queryKeys } from '@/shared/queryKeys';

interface DocumentAnalyticsSummary {
	totalViews: number;
	totalDownloads: number;
	lastAccessed: string | null;
	links: Array<{
		linkId: string;
		lastViewed: string | null;
		lastDownloaded: string | null;
	}>;
}

const fetchDocumentAnalytics = async (documentId: string): Promise<DocumentAnalyticsSummary> => {
	const { data } = await axios.get<DocumentAnalyticsSummary>(
		`/api/documents/${documentId}/analytics`,
	);
	return data;
};

const useDocumentAnalyticsQuery = (documentId: string, documentLinkId?: string) => {
	return useQuery({
		queryKey: queryKeys.documents.analytics(documentId),
		queryFn: () => fetchDocumentAnalytics(documentId),
	});
};

export default useDocumentAnalyticsQuery;
