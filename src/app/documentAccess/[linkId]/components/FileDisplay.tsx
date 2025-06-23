import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';

import { Box, Button, Fade, Grid2, Skeleton, Stack, Typography } from '@mui/material';

import { useToast } from '@/hooks';
import { useCreateDocumentAnalyticsMutation } from '@/hooks/data';

import { FileDownloadIcon } from '@/icons';
import { AnalyticsEventType } from '@/shared/enums';
import { FileDisplayPayload } from '@/shared/models';
import { formatFileSize, isViewableFileType } from '@/shared/utils';
import { downloadFile } from '@/shared/utils/fileUtils';

export enum LoadPhase {
	Idle = 'idle',
	Bundle = 'bundle',
	Img = 'img',
	Pdf = 'pdf',
	Done = 'done',
}
const PDFViewer = dynamic(() => import('@/components/fileHandling/PDFViewer'), {
	ssr: false,
});

const LoadingSkeleton = () => (
	<Stack
		gap={6}
		height='83vh'
		alignItems='center'>
		<Stack
			direction='row'
			gap={80}
			mt={5}
			alignItems='center'>
			<Skeleton
				variant='rectangular'
				width={360}
				height={24}
			/>
			<Skeleton
				variant='rectangular'
				width={144}
				height={40}
			/>
		</Stack>
		<Skeleton
			variant='rectangular'
			width={800}
			height='100%'
		/>
	</Stack>
);

const FileDisplay = ({
	signedUrl,
	fileName,
	size,
	fileType,
	documentId = '',
	documentLinkId = '',
}: FileDisplayPayload) => {
	const [phase, setPhase] = useState<LoadPhase>(LoadPhase.Idle);

	const viewMode = phase !== LoadPhase.Idle; // “preview” screen vs access buttons
	const isLoading = viewMode && phase !== LoadPhase.Done; // drives skeleton
	const handlePdfMount = useCallback(() => setPhase(LoadPhase.Pdf), [setPhase]);
	const handlePdfReady = useCallback(() => setPhase(LoadPhase.Done), [setPhase]);

	const isPdf = fileType === 'application/pdf';
	const isImage = fileType?.startsWith('image/');

	const { showToast } = useToast();
	const supportsPreview = isViewableFileType(fileType ?? '');
	const analytics = useCreateDocumentAnalyticsMutation();

	const logAnalytics = useCallback(
		(event: AnalyticsEventType) =>
			analytics.mutateAsync({ documentId, documentLinkId, eventType: event }),
		[analytics, documentId, documentLinkId],
	);

	const handleViewFile = () => {
		setPhase(isImage ? LoadPhase.Bundle : LoadPhase.Img);
	};

	const handleDownloadFile = useCallback(async () => {
		try {
			await logAnalytics(AnalyticsEventType.DOWNLOAD);
			await downloadFile(signedUrl, fileName);
			showToast({ variant: 'info', message: 'File download should begin soon' });
		} catch (err) {
			console.error('Download error', err);
			showToast({ variant: 'error', message: 'Could not download file' });
		}
	}, [signedUrl, fileName, logAnalytics, showToast]);

	return (
		<Grid2 height={viewMode ? '100%' : 'inherit'}>
			<Box
				textAlign='center'
				display='flex'
				flexDirection='column'
				alignItems='center'>
				{/* Header section */}
				<Typography
					variant='h1'
					color='text.secondary'>
					File is ready for {viewMode ? 'preview' : 'access'}
				</Typography>

				{!viewMode && (
					<Typography
						variant='subtitle2'
						mb={3}>
						Thanks for verifying your details. You can now access the document.
					</Typography>
				)}

				{!isLoading && (
					<Box
						display='flex'
						gap={80}
						mt={5}
						justifyContent='space-around'>
						<Typography
							variant='h2'
							display='flex'
							my={{ sm: 2, md: 3, lg: 4 }}
							gap={2}>
							Document Name:{' '}
							<Typography
								variant='inherit'
								color='primary'>
								{fileName} ({formatFileSize(size)})
							</Typography>
						</Typography>

						{viewMode && (
							<Button
								aria-label='Download document'
								variant='contained'
								endIcon={
									<FileDownloadIcon
										color='white'
										width={25}
										height={25}
									/>
								}
								onClick={handleDownloadFile}
								size='medium'>
								Download{' '}
							</Button>
						)}
					</Box>
				)}

				{/* buttons (access-mode) */}
				{!viewMode && (
					<Box
						mt={24}
						display='flex'
						justifyContent='center'
						gap={32}>
						{supportsPreview && (
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
				)}

				{/* preview-mode Loading*/}
				{isLoading && <LoadingSkeleton />}

				{/* viewer (preview-mode) */}
				{viewMode && (
					<Fade
						in={phase === LoadPhase.Done}
						timeout={1000}>
						<Box>
							{isPdf && (
								<PDFViewer
									url={signedUrl}
									documentId={documentId}
									linkId={documentLinkId}
									onMount={handlePdfMount} // dynamic bundle finished
									onReady={handlePdfReady} // PDF fully rendered (or errored)
								/>
							)}
							{isImage && (
								<Box
									m={5}
									component='img'
									src={signedUrl}
									alt={fileName}
									maxHeight='90vh'
									maxWidth='100%'
									loading='lazy'
									onLoad={() => setPhase(LoadPhase.Done)}
									sx={{ objectFit: 'contain', borderRadius: 1 }}
								/>
							)}
						</Box>
					</Fade>
				)}
			</Box>
		</Grid2>
	);
};

export default FileDisplay;
