import { Container } from '@mui/material';
import { UuidParam } from '@/shared/validation/routeSchemas';
import DocumentView from './components/DocumentView';
import { notFound } from 'next/navigation';

/** Server component – validates param then streams client UI. */
export default async function DocumentDetailsPage(props: {
	params: Promise<{ documentId: string }>;
}) {
	const parsedDocumentId = UuidParam.safeParse((await props.params).documentId);

	if (!parsedDocumentId.success) notFound();

	return (
		<Container sx={{ pb: 15 }}>
			<DocumentView documentId={parsedDocumentId.data} />
		</Container>
	);
}
