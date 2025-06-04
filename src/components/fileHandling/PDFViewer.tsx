'use client';

import { Box, Button, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import { useCreateDocumentAnalytics } from '@/hooks';
import { AnalyticsEventType } from '@/shared/enums';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PDFViewerProps {
	url: string;
	documentId: string;
	linkId?: string;
	visitorId?: number;
}

export default function PDFViewer({ url, documentId, linkId, visitorId }: PDFViewerProps) {
	const [numPages, setNumPages] = useState<number>();
	const [page, setPage] = useState(1);
	const logged = useRef(false); // ensures single VIEW row
	const analytics = useCreateDocumentAnalytics();

	const trackFileView = () => {
		if (logged.current) return;
		analytics.mutateAsync({
			documentId,
			documentLinkId: linkId ?? '',
			eventType: AnalyticsEventType.VIEW,
			visitorId,
		});
		logged.current = true;
	};

	return (
		<Box textAlign='center'>
			<Document
				file={url}
				onLoadSuccess={({ numPages }) => {
					setNumPages(numPages);
					trackFileView();
				}}>
				<Page
					pageNumber={page}
					width={780}
				/>
			</Document>

			{/* simple navigation – same UX we had before */}
			{numPages && numPages > 1 && (
				<Box
					mt={4}
					display='flex'
					alignItems='center'
					gap={2}
					justifyContent='center'>
					<Button
						disabled={page === 1}
						onClick={() => setPage((p) => p - 1)}>
						Previous
					</Button>
					<Typography>
						Page {page} of {numPages}
					</Typography>
					<Button
						disabled={page === numPages}
						onClick={() => setPage((p) => p + 1)}>
						Next
					</Button>
				</Box>
			)}
		</Box>
	);
}
