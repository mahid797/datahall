'use client';

import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { Box, Typography } from '@mui/material';

import { useCreateDocumentAnalyticsMutation } from '@/hooks/data';

import Paginator from '../navigation/Paginator';

import { AnalyticsEventType } from '@/shared/enums';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PDFViewerProps {
	url: string;
	documentId: string;
	linkId?: string;
	visitorId?: number;
	onReady?: () => void;
	onMount?: () => void;
}

export default function PDFViewer({
	url,
	documentId,
	linkId,
	visitorId,
	onReady,
	onMount,
}: PDFViewerProps) {
	const [numPages, setNumPages] = useState<number>();
	const [page, setPage] = useState<number | null>(null);
	const logged = useRef(false); // ensures single VIEW row
	const analytics = useCreateDocumentAnalyticsMutation();

	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		onMount?.();
	}, [onMount]);

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
		<>
			<Box
				display='flex'
				flexDirection='column'
				alignItems='center'
				maxHeight={`calc(100vh - 245px)`}
				mx='auto'
				my={4}
				px={2}
				tabIndex={0}
				sx={{
					border: 1,
					borderColor: 'divider',
					borderRadius: 2,
					boxShadow: 2,
					overflowY: 'auto',
				}}>
				<Document
					file={url}
					onLoadSuccess={({ numPages }) => {
						setNumPages(numPages);
						setPage(1);
						trackFileView();
						onReady?.();
					}}
					loading={null}
					onLoadError={(e) => {
						setError(e);
						onReady?.();
					}}
					error={
						<Typography
							color='error'
							align='center'
							py={4}>
							{error?.message || 'Failed to load PDF'}
						</Typography>
					}>
					{page && (
						<Page
							pageNumber={page}
							width={780}
							renderTextLayer={false}
							renderAnnotationLayer={false}
						/>
					)}
				</Document>
			</Box>
			{numPages && numPages > 1 && page && (
				<Paginator
					size='sm'
					nextPage={page}
					totalPages={numPages}
					pageSize={1}
					totalItems={numPages}
					onPageChange={setPage}
				/>
			)}
		</>
	);
}
