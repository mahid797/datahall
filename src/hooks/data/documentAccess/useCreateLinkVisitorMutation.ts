import axios from 'axios';
import { useMutation } from '@tanstack/react-query';

import { PublicLinkAccessPayload } from '@/shared/validation/publicLinkSchemas';
import { FileDisplayPayload } from '@/shared/models';

interface VisitorSubmissionResponse {
	message: string;
	data: FileDisplayPayload;
}

const submitVisitorDetails = async ({
	linkId,
	payload,
}: {
	linkId: string;
	payload: PublicLinkAccessPayload;
}) => {
	const { data } = await axios.post<VisitorSubmissionResponse>(
		`/api/public_links/${linkId}/access`,
		payload,
	);
	return data;
};

const useCreateLinkVisitorMutation = () => {
	const mutation = useMutation({
		mutationFn: submitVisitorDetails,
		retry: false,
		onError: (error) => {
			console.error('Error submitting visitor details: ', error);
		},
	});

	return {
		mutateAsync: mutation.mutateAsync,
		isPending: mutation.isPending,
		error: mutation.error,
	};
};

export default useCreateLinkVisitorMutation;
