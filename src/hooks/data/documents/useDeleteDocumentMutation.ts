import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/queryKeys';

const deleteDocumentById = async (documentId: string): Promise<void> => {
	const response = await axios.delete(`/api/documents/${documentId}`);

	return response.data;
};

const useDeleteDocumentMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteDocumentById,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
		},
	});
};

export default useDeleteDocumentMutation;
