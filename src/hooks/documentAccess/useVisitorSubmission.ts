import axios from 'axios';
import { useMutation } from '@tanstack/react-query';

import { PublicLinkAccessPayload } from '@/shared/validation/publicLinkSchemas';
import { FileAccessPayload } from '@/shared/models';

interface VisitorSubmissionResponse {
	message: string;
	data: FileAccessPayload;
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

const useVisitorSubmission = () => {
	const mutation = useMutation({
		mutationFn: submitVisitorDetails,
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

export default useVisitorSubmission;
