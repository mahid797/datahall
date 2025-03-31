import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const submitVisitorDetails = async ({ linkId, payload }: { linkId: string; payload: any }) => {
	const response = await axios.post(`/api/public_links/${linkId}/access`, payload);

	return response.data;
};

const useVisitorSubmission = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (variables: { linkId: string; payload: any }) => submitVisitorDetails(variables),
		onSuccess: () => {
			// queryClient.invalidateQueries({ queryKey: [''] });
		},
		onError: (error) => {
			console.error('Error adding document: ', error);
		},
	});
};

export default useVisitorSubmission;
