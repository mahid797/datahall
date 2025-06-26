import React from 'react';

import { Box, Button, Typography } from '@mui/material';

import { LinkBrokenIcon } from '@/icons';

interface AccessErrorProps {
	message: string;
	description?: string;
	onRetry?: () => void;
}

const AccessError: React.FC<AccessErrorProps> = (props) => {
	return (
		<Box
			display='flex'
			flexDirection='column'
			alignItems='center'
			textAlign='center'
			gap={20}>
			<Box
				display='flex'
				mb={2}
				gap={2}>
				<Typography
					variant='h1'
					color='text.error'>
					{props.message}
				</Typography>
				<LinkBrokenIcon />
			</Box>
			<Typography variant='body1'>
				The link you used is no longer active. If you believe this is an error, please contact the
				document owner.
			</Typography>

			{props.onRetry && (
				<Box mt={6}>
					<Button
						variant='contained'
						onClick={props.onRetry}>
						Try again
					</Button>
				</Box>
			)}
		</Box>
		// </Box>
	);
};

export default AccessError;
