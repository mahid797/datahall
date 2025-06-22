/**
 * useDeleteLinkMutation.ts
 * -----------------------------------------------------------------------------
 * Deletes a link for a given document and invalidates the document's links list.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { queryKeys } from '@/shared/queryKeys';

interface DeleteLinkArgs {
	documentId: string;
	linkId: string;
}

const deleteLink = async ({ documentId, linkId }: DeleteLinkArgs) => {
	await axios.delete(`/api/documents/${documentId}/links/${linkId}`);
};

export default function useDeleteLinkMutation() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, DeleteLinkArgs>({
		mutationFn: deleteLink,
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.documents.links(variables.documentId),
			});
		},
		onError: (error) => {
			console.error('Error deleting link: ', error);
		},
	});
}
