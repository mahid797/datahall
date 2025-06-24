import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { AnalyticsEventType } from '@/shared/enums';
import { queryKeys } from '@/shared/queryKeys';

interface CreateAnalyticsArgs {
	documentId: string;
	documentLinkId: string;
	eventType: AnalyticsEventType;
	meta?: unknown;
	visitorId?: number;
}

const createAnalytics = async ({ documentLinkId, ...rest }: CreateAnalyticsArgs) => {
	const { data } = await axios.post(`/api/public_links/${documentLinkId}/analytics`, rest);

	return data;
};

const useCreateDocumentAnalyticsMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createAnalytics,
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.links.analytics(variables.documentLinkId),
			});
		},
	});
};

export default useCreateDocumentAnalyticsMutation;
