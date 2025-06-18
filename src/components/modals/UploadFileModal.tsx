'use client';
import React, { useState } from 'react';
import {
	DialogTitle,
	DialogContent,
	DialogActions,
	Typography,
	Button,
	IconButton,
	Box,
	DialogContentText,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { TrashIcon } from '@/icons';
import { FileTypeConfig } from '@/shared/config/fileIcons';
import { parseFileSize } from '@/shared/utils';
import CustomUploader from '../fileHandling/CustomUploader';
import CustomCircularProgress from '../loaders/CustomCircularProgress';

interface FileInfo {
	name: string;
	size: string;
	type: string;
}

interface UploadFileModalProps {
	title?: string;
	description?: string;
	maxFileSize?: string; // e.g. '1 MB'
	fileFormats?: string; // e.g. 'PDF'
	closeModal: () => void; // from the system
	onUploadComplete?: () => void;
}

export default function UploadFileModal({
	title = 'Upload file(s)',
	description,
	maxFileSize = '1 MB',
	fileFormats = 'PDF',
	closeModal,
	onUploadComplete,
}: UploadFileModalProps) {
	const [progress, setProgress] = useState(10);
	const [fileInfo, setFileInfo] = useState<FileInfo>({ name: '', size: '', type: '' });

	// Compute whether we're in progress / completed / failed:
	const fileSizeInBytes = fileInfo.size ? parseFileSize(fileInfo.size) : 0;
	const maxFileSizeInBytes = parseFileSize(maxFileSize);

	let status: 'failed' | 'completed' | 'inProgress' = 'inProgress';
	if (fileSizeInBytes > maxFileSizeInBytes) {
		status = 'failed';
	} else if (progress >= 100) {
		status = 'completed';
	}

	function handleCancel() {
		// Reset if needed, then close
		setFileInfo({ name: '', size: '', type: '' });
		closeModal();
	}

	function handleConfirm() {
		if (onUploadComplete && status === 'completed') {
			onUploadComplete();
		}
		closeModal();
	}

	const iconSrc =
		fileInfo.type in FileTypeConfig
			? FileTypeConfig[fileInfo.type as keyof typeof FileTypeConfig]
			: FileTypeConfig['General'];

	return (
		<>
			<DialogTitle variant='h2'>{title}</DialogTitle>
			<DialogContent>
				{description && (
					<Box mb={4}>
						<Typography variant='body2'>{description}</Typography>
					</Box>
				)}

				<Box
					mt={12}
					mb={3}>
					<CustomUploader
						allowedFormats={fileFormats}
						fileInfo={fileInfo}
						onFileInfoChange={setFileInfo}
					/>
				</Box>
				<Box mb={11}>
					<Typography variant='h6'>
						Supported formats: {fileFormats} | Max file size: {maxFileSize} each.
					</Typography>
				</Box>

				{fileInfo.name && (
					<Grid
						container
						columnSpacing={{ xs: 1, sm: 2, md: 3 }}
						alignItems='center'
						border={1}
						borderRadius={4}
						borderColor='text.notes'
						minHeight='7.5vh'
						mb={5}>
						<Grid
							size={2}
							display='flex'
							justifyContent='center'>
							<Box
								component={iconSrc}
								sx={{ width: 35, height: 35 }}
							/>
						</Grid>
						<Grid size={status === 'failed' ? 7 : 8}>
							<Typography
								variant='body1'
								color={status === 'failed' ? 'error' : undefined}>
								{fileInfo.name}
							</Typography>
							<Typography
								variant='body2'
								color={status === 'failed' ? 'error' : undefined}>
								{fileInfo.size}
							</Typography>
						</Grid>
						<Grid size={status === 'failed' ? 3 : 2}>
							{status === 'inProgress' && (
								<CustomCircularProgress
									progress={progress}
									handleProgress={setProgress}
								/>
							)}
							{status === 'completed' && (
								<IconButton>
									<Box
										component={TrashIcon}
										width={{ sm: '1rem', md: '1.1rem', lg: '1.18rem' }}
										height='auto'
									/>
								</IconButton>
							)}
							{status === 'failed' && (
								<Typography
									variant='body2'
									color={status === 'failed' ? 'error' : undefined}>
									Upload Failed
								</Typography>
							)}
						</Grid>
					</Grid>
				)}
			</DialogContent>
			<DialogActions sx={{ mr: 8, mb: 7 }}>
				<Button
					variant='text'
					color='secondary'
					onClick={handleCancel}>
					Cancel
				</Button>
				<Button
					variant='contained'
					onClick={handleConfirm}
					disabled={status === 'inProgress' || !fileInfo.name}>
					{status === 'completed' ? 'Done' : 'Upload'}
				</Button>
			</DialogActions>
		</>
	);
}
