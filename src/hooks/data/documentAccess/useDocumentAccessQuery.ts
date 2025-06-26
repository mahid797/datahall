import { QueryFunctionContext, useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { queryKeys } from '@/shared/queryKeys';

/**
 * @deprecated
 * This interface is deprecated and will be removed in future versions.
 */
interface PublicLinkMeta {
	data: {
		isPasswordProtected: boolean;
		visitorFields: string[];
		signedUrl?: string;
	};
	message: string;
}

const fetchDocumentDetails = async ({ queryKey }: QueryFunctionContext) => {
	const [_base, linkId] = queryKey as ReturnType<typeof queryKeys.links.access>;
	const { data } = await axios.get<PublicLinkMeta>(`/api/public_links/${linkId}`);
	return data;
};

/**
 * @deprecated
 * This hook is deprecated and will be removed in future versions.
 */
const useDocumentAccessQuery = (linkId: string) =>
	useQuery({
		queryKey: queryKeys.links.access(linkId),
		queryFn: fetchDocumentDetails,
		staleTime: 60_000,
		retry: false,
	});

export default useDocumentAccessQuery;
