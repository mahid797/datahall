import axios from 'axios';
import { useMutation } from '@tanstack/react-query';

const submitVisitorDetails = async ({ linkId, payload }: { linkId: string; payload: any }) => {
	const response = await axios.post(`/api/public_links/${linkId}/access`, payload);

	return response.data;
};

const useVisitorSubmission = () => {
	return useMutation({
		mutationFn: async (variables: { linkId: string; payload: any }) =>
			submitVisitorDetails(variables),
		onError: (error) => {
			console.error('Error adding document: ', error);
		},
	});
};

export default useVisitorSubmission;
