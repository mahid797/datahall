'use client';

import { useState, MouseEvent } from 'react';
import { Avatar, Box, Button, CircularProgress, Link, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { useToast } from '@/hooks';
// ***** Modals V2 (Typed Global System) *****
import { useModalContext } from '@/providers/modal/ModalProvider';
// ***** Legacy Approach: ModalWrapper (Commented Out) *****
// import { ModalWrapper } from '@/components';
// import { useModal } from '@/hooks';

import ColorPickerBox from './ColorPickerBox';

import { PencilIcon } from '@/icons';
import AvatarActions from '@/components/common/AvatarCard';
/**
 * NOTE FOR DEVELOPERS:
 * =====================
 * This file has been updated to use our new typed modals approach.
 * I have commented out the old 'ModalWrapper' usage at the bottom so you can see how it was before.
 *
 * - "Modals V2" uses a typed global system: openModal({ type: ... }),
 *   defined in ModalProvider + ModalContainer + ModalRegistry.
 * - The old usage used: useModal() + <ModalWrapper variant="..." />
 *
 * TEMPORARY: Once the entire project is migrated to the new approach,
 * we can safely remove the old references and these explanatory comments.
 * ============================================================
 */
export default function BrandingSetting() {
	const { showToast } = useToast();

	const [loading, setLoading] = useState(false);

	/**
	 * ==============================
	 * OLD MODAL LOGIC (commented usage)
	 * ==============================
	 * We keep them commented out so devs can see how it worked before.
	 */
	// const deleteModal = useModal();
	// const uploadModal = useModal();

	// const handleDelete = () => {
	//   console.log('Logo deleted');
	//   showToast({
	//     message: 'Logo deleted!',
	//     variant: 'error',
	//   });
	// };

	// const handleUpdate = () => {
	//   console.log('Logo updated successfully!');
	//   showToast({
	//     message: 'Logo updated successfully!',
	//     variant: 'success',
	//   });
	// };

	/**
	 * ==================================================
	 * NEW APPROACH: MODALS V2 (TYPED GLOBAL SYSTEM)
	 * ==================================================
	 * We call openModal({ type: 'deleteConfirm' | 'uploadFile', ... }) to open modals.
	 * This replaces the old <ModalWrapper variant="..." /> usage.
	 */
	const { openModal } = useModalContext();

	const handleDelete = (e: MouseEvent) => {
		// We do preventDefault() to avoid the link jump
		e.preventDefault();

		openModal({
			type: 'deleteConfirm',
			contentProps: {
				title: 'Really delete this logo?',
				description:
					'When you delete this logo, all the links associated with the logo will also be removed. This action is non-reversible.',
				onConfirm: () => {
					console.log('Logo deleted successfully!');
					showToast({
						message: 'Logo deleted successfully!',
						variant: 'success',
					});
				},
			},
		});
	};

	const handleUpload = (e: MouseEvent) => {
		e.preventDefault();

		openModal({
			type: 'uploadFile',
			contentProps: {
				title: 'Upload logo',
				maxFileSize: '3 MB',
				fileFormats: 'JPG, PNG',
				onUploadComplete: () => {
					console.log('Logo updated successfully!');
					showToast({
						message: 'Logo updated successfully!',
						variant: 'success',
					});
				},
			},
		});
	};

	// Simulate saving some branding settings
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
							{/* ============== NEW COMPONENT: Moved the Avatar Code ============== */}
							{/* <AvatarActions
								initials='BU'
								size={86}
								onDelete={handleDelete}
								onUpdate={handleUpload}
							/> */}
							{/* ============== NEW Approach: Modals V2 ============== */}
							<Link
								href='#'
								underline='hover'
								sx={{ px: 4, color: 'text.secondary' }}
								onClick={handleDelete}>
								Delete
							</Link>
							<Link
								href='#'
								underline='hover'
								sx={{ px: 4, color: 'text.brand' }}
								onClick={handleUpload}>
								Update
							</Link>
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

			{/**
			 * =================================================================
			 * OLD "ModalWrapper" usage commented out, for reference:
			 * - Removing these comments would revert to the old approach
			 * - This is purely so devs can see how it used to be
			 * =================================================================
			 */}

			{/* <ModalWrapper
				variant='delete'
				title='Really delete this logo?'
				description='When you delete this logo, all the links associated with the logo will also be removed. This action is non-reversible.'
				confirmButtonText='Delete logo'
				open={deleteModal.isOpen}
				onClose={handleDelete}
				toggleModal={deleteModal.closeModal}
			/> */}

			{/* <ModalWrapper
				variant='upload'
				title='Upload logo'
				confirmButtonText='Update'
				open={uploadModal.isOpen}
				onClose={handleUpdate}
				maxFileSize='3 MB'
				fileFormats='JPG, PNG'
				toggleModal={uploadModal.closeModal}
			/> */}
		</>
	);
}
