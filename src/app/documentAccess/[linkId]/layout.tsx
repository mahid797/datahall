import React from 'react';
import { Typography, Box, Link } from '@mui/material';
import { BlueWaveLogo } from '@/components';

interface RootLayoutProps {
	children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<Box
			display='flex'
			justifyContent='space-between'
			alignItems='center'
			flexDirection='column'
			p={20}
			height='100vh'>
			<Box width={{ sm: '15rem', md: '18rem', lg: '20rem' }}>
				<BlueWaveLogo
					width='100%'
					height='auto'
				/>
			</Box>
			{children}
			<Box
				display='flex'
				alignItems='center'
				gap={1}>
				<Typography variant='body1'>Need help?</Typography>
				<Link
					href=''
					underline='hover'>
					Contact Support
				</Link>
			</Box>
		</Box>
	);
}
