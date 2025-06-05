import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import { DocumentType } from '@/shared/models';
import { queryKeys } from '@/shared/queryKeys';

interface DocumentResponse {
	documents: DocumentType[];
}

const fetchDocuments = async (): Promise<DocumentResponse> => {
	const response = await axios.get('/api/documents');

	return response.data;
};

const useDocumentsQuery = () => {
	return useQuery({
		queryKey: queryKeys.documents.all,
		queryFn: fetchDocuments,
	});
};

export default useDocumentsQuery;
