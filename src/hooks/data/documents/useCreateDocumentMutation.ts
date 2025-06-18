import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/shared/queryKeys';

const uploadDocument = async (formData: FormData) => {
	const response = await axios.post('/api/documents', formData);

	return response.data;
};

const useCreateDocumentMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (formData: FormData) => uploadDocument(formData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
		},
		onError: (error) => {
			console.error('Error adding document: ', error);
		},
	});
};

export default useCreateDocumentMutation;
