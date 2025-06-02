'use client';
import { useState } from 'react';

import { Avatar, Box, Button, CircularProgress, Link, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { ModalWrapper } from '@/components';

import ColorPickerBox from './ColorPickerBox';

import { useModal, useToast } from '@/hooks';

import { PencilIcon } from '@/icons';
import AvatarActions from '@/components/common/AvatarCard';

export default function BrandingSetting() {
	const deleteModal = useModal();
	const uploadModal = useModal();
	const { showToast } = useToast();

	const [loading, setLoading] = useState(false);

	const handleDelete = () => {
		console.log('Logo deleted');
		showToast({
			message: 'Logo deleted!',
			variant: 'error',
		});
	};

	const handleSave = () => {
		setLoading(true);

		setTimeout(() => {
			console.log('Settings updated successfully!');
			showToast({
				message: 'Settings updated successfully!',
				variant: 'success',
			});
			setLoading(false);
		}, 2000);
	};

	const handleUpdate = () => {
		console.log('Logo updated successfully!');
		showToast({
			message: 'Logo updated successfully!',
			variant: 'success',
		});
	};

	return (
		<>
			<Box>
				<Box mb={{ sm: 12, md: 14, lg: 16 }}>
					<Typography variant='subtitle2'>
						Customize how your brand appears to the public across DataHall documents your visitors
						see.
					</Typography>
				</Box>
				<Box>
					<Grid
						container
						rowSpacing={12}
						columnSpacing={{ sm: 1, md: 2, lg: 3 }}
						alignItems='center'>
						{/* Logo */}
						<Grid size={5}>
							<Typography variant='h4'>Logo</Typography>
						</Grid>
						<Grid size={7}>
							<AvatarActions
								initials='BU'
								size={86}
								onDelete={deleteModal.openModal}
								onUpdate={uploadModal.openModal}
							/>
						</Grid>

						{/* Background color */}
						<Grid size={5}>
							<Typography variant='h4'>Background color</Typography>
						</Grid>
						<Grid size={7}>
							<ColorPickerBox />
						</Grid>

						{/* Font color */}
						<Grid size={5}>
							<Typography variant='h4'>Font color</Typography>
						</Grid>
						<Grid size={7}>
							<ColorPickerBox />
						</Grid>

						<Box
							width='100%'
							display='flex'
							justifyContent='flex-end'
							mt={{ sm: 40, md: 50, lg: 60 }}>
							<Button
								variant='contained'
								onClick={handleSave}
								disabled={loading}
								endIcon={
									loading ? (
										<CircularProgress
											size={20}
											color='inherit'
										/>
									) : null
								}>
								{loading ? 'Saving...' : 'Save'}
							</Button>
						</Box>
					</Grid>
				</Box>
			</Box>

			<ModalWrapper
				variant='delete'
				title='Really delete this logo?'
				description='When you delete this logo, all the links associated with the logo will also be removed. This action is non-reversible.'
				confirmButtonText='Delete logo'
				open={deleteModal.isOpen}
				onClose={handleDelete}
				toggleModal={deleteModal.closeModal}
			/>

			<ModalWrapper
				variant='upload'
				title='Upload logo'
				confirmButtonText='Update'
				open={uploadModal.isOpen}
				onClose={handleUpdate}
				maxFileSize='3 MB'
				fileFormats='JPG, PNG'
				toggleModal={uploadModal.closeModal}
			/>
		</>
	);
}
