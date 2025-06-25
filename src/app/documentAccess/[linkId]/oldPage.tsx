'use client';

import React, { use } from 'react';

import { Box, Button, Typography } from '@mui/material';
import AccessPage from './components/AccessPage';

/**
 * @deprecated
 * This component is deprecated and will be removed in future versions.
 */
const LinkIdPage = ({ params }: { params: Promise<{ linkId: string }> }) => {
	const { linkId } = use(params);

	const [showFileAccess, setShowFileAccess] = React.useState(false);

	const handleConfirmClick = () => {
		setShowFileAccess(true);
	};

	return (
		<>
			{!showFileAccess ? (
				<Box
					display='flex'
					alignItems='center'
					flexDirection='column'
					gap={{ sm: 30, md: 35, lg: 40 }}>
					<Box textAlign='center'>
						<Typography
							mb={2}
							variant='h1'>
							A secure file has been shared with you
						</Typography>
						<Typography variant='body1'>
							Please confirm your identity to access this document
						</Typography>
					</Box>
					<Button
						variant='contained'
						onClick={handleConfirmClick}>
						Confirm
					</Button>
				</Box>
			) : (
				<AccessPage linkId={linkId} />
			)}
		</>
	);
};

export default LinkIdPage;
