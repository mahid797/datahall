import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const uploadDocument = async (formData: FormData) => {
	const response = await axios.post('/api/documents', formData);

	return response.data;
};

const useUploadDocument = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (formData: FormData) => uploadDocument(formData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['documents'] });
		},
		onError: (error) => {
			console.error('Error adding document: ', error);
		},
	});
};

export default useUploadDocument;
