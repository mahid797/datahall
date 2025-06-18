import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { AnalyticsPeriod, AnalyticsSummary } from '@/shared/models/analyticsModels';
import { queryKeys } from '@/shared/queryKeys';

/**
 * Fetches analytics summary + buckets for one document.
 * @param documentId Document ID
 * @param period     'all' | '30d' | '7d'   (default 'all')
 */
const useAnalyticsQuery = (documentId: string, period: AnalyticsPeriod = 'all') => {
	const fetcher = async (): Promise<AnalyticsSummary> => {
		const { data } = await axios.get<AnalyticsSummary>(`/api/documents/${documentId}/analytics`, {
			params: { period },
		});
		return data;
	};

	return useQuery({
		queryKey: queryKeys.documents.analytics(documentId, period),
		queryFn: fetcher,
		staleTime: 60_000, // 1 min
		refetchOnWindowFocus: false,
	});
};

export default useAnalyticsQuery;
