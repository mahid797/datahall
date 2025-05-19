import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { QueryFunctionContext } from '@tanstack/react-query';

const fetchDocumentDetails = async ({ queryKey }: QueryFunctionContext) => {
	const [_, linkId] = queryKey as [string, string];
	const response = await axios.get(`/api/public_links/${linkId}`);

	return response.data;
};

const useDocumentAccess = (linkId: string) => {
	return useQuery({
		queryKey: ['documentAccess', linkId],
		queryFn: fetchDocumentDetails,
		retry: false,
	});
};

export default useDocumentAccess;
