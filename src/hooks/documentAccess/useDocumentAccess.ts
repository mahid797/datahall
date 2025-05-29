import { QueryFunctionContext, useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { queryKeys } from '@/shared/queryKeys';

const fetchDocumentDetails = async ({ queryKey }: QueryFunctionContext) => {
	const [_, linkId] = queryKey as [string, string];
	const response = await axios.get(`/api/public_links/${linkId}`);

	return response.data;
};

const useDocumentAccess = (linkId: string) => {
	return useQuery({
		queryKey: queryKeys.links.access(linkId),
		queryFn: fetchDocumentDetails,
		retry: false,
	});
};

export default useDocumentAccess;
