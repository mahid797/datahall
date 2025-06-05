import React, { useState } from 'react';

import { Typography, Box, Button } from '@mui/material';

import { useToast } from '@/hooks';
import { useCreateDocumentAnalyticsMutation } from '@/hooks/data';

import { formatFileSize, isViewableFileType } from '@/shared/utils';
import { AnalyticsEventType } from '@/shared/enums';
import { downloadFile } from '@/shared/utils/fileUtils';
import { FileAccessPayload } from '@/shared/models';
import dynamic from 'next/dynamic';

const PDFViewer = dynamic(() => import('@/components/fileHandling/PDFViewer'), {
	ssr: false,
	loading: () => <Typography>Loading preview…</Typography>,
});

const FileDisplay = ({
	signedUrl,
	fileName,
	size,
	fileType,
	documentId = '',
	documentLinkId = '',
}: FileAccessPayload) => {
	const { showToast } = useToast();
	const trackDocumentAnalytics = useCreateDocumentAnalyticsMutation();
	const showFileViewButton = isViewableFileType(fileType || '');
	const [displayPdfViewer, setDisplayPdfViewer] = useState(false);

	const handleLogDocumentAnalytics = (eventType: AnalyticsEventType) =>
		trackDocumentAnalytics.mutateAsync({ documentId, documentLinkId, eventType });

	const handleDownloadFile = async () => {
		try {
			await handleLogDocumentAnalytics(AnalyticsEventType.DOWNLOAD);
			await downloadFile(signedUrl, fileName);

			showToast({ message: 'File downloaded successfully', variant: 'success' });
		} catch (error) {
			console.error('Error downloading the file:', error);
			showToast({
				message: 'Error downloading the file. Please try again.',
				variant: 'error',
			});
		}
	};

	const handleViewFile = () => setDisplayPdfViewer(true);

	return (
		<Box textAlign='center'>
			<Typography
				variant='h1'
				color='text.secondary'>
				File is ready for download
			</Typography>
			<Typography variant='subtitle2'>
				Thanks for verifying your details. You can now download the document.
			</Typography>

			{/* Document Info */}
			<Box
				display='flex'
				justifyContent='center'
				mt={{ sm: 15, md: 18, lg: 20 }}
				mx={0}
				gap={2}>
				<Typography variant='subtitle2'>Document:</Typography>
				<Typography
					variant='subtitle2'
					color='primary'>
					{fileName} ({formatFileSize(size)})
				</Typography>
			</Box>

			{/* File Actions */}
			<Box
				display='flex'
				justifyContent='center'
				gap={{ sm: 30, md: 35, lg: 40 }}
				mt={{ sm: 30, md: 35, lg: 40 }}>
				{showFileViewButton && (
					<Button
						variant='contained'
						onClick={handleViewFile}>
						View file
					</Button>
				)}

				<Button
					variant='contained'
					onClick={handleDownloadFile}>
					Download file
				</Button>
			</Box>

			{/* PDF Viewer */}
			{displayPdfViewer && (
				<PDFViewer
					url={signedUrl}
					documentId={documentId}
					linkId={documentLinkId}
				/>
			)}
		</Box>
	);
};

export default FileDisplay;
