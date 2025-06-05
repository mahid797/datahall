import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { LinkVisitor } from '@/shared/models';
import { queryKeys } from '@/shared/queryKeys';

export default function useLinkVisitorsQuery(
	documentId: string,
	linkId: string,
	enabled?: boolean,
) {
	const fetchLinkVisitors = async (): Promise<LinkVisitor[]> => {
		const { data } = await axios.get<{ data: LinkVisitor[] }>(
			`/api/documents/${documentId}/links/${linkId}/log`,
		);
		return data.data;
	};

	return useQuery({
		queryKey: queryKeys.links.visitors(linkId), // 🔑 canonical key
		queryFn: fetchLinkVisitors,
		enabled,
		staleTime: 1000 * 30,
		refetchInterval: 1000 * 60,
	});
}
