import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/queryKeys';
import { DocumentLinkPayload } from '@/shared/validation/documentLinkSchemas';

interface Params {
	documentId: string;
	payload: DocumentLinkPayload;
}

interface Response {
	message: string;
	link: { linkUrl: string };
}

/**
 * Creates a new link for the given document and invalidates the
 * document-links list cache on success.
 */
export default function useCreateLinkMutation() {
	const queryClient = useQueryClient();

	return useMutation<Response, Error, Params>({
		mutationFn: async ({ documentId, payload }) => {
			const res = await axios.post<Response>(`/api/documents/${documentId}/links`, payload);
			return res.data;
		},
		onSuccess: (_data, { documentId }) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.documents.links(documentId) });
		},
	});
}
