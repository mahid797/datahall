import { BlueWaveLogo } from '@/components';
import { Grid2, Link, Typography } from '@mui/material';
import React from 'react';

interface RootLayoutProps {
	children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<>
			<Grid2
				container
				direction='column'
				justifyContent='center'
				alignItems='center'
				px={20}
				py={{ xs: 2, sm: 4, md: 6, lg: 8 }}
				height='100vh'
				rowGap={4}>
				{/* ── Row 1 ──── */}
				<Grid2>
					<BlueWaveLogo
						width='100%'
						height='2.5rem'
					/>
				</Grid2>
				{/* ── Row 2 ──── */}
				<Grid2
					container
					flexGrow={1}
					justifyContent='center'
					alignItems='center'
					overflow='auto'
					width='100%'>
					{children} {/* Removed the second <Grid2> and added to FileDisplay.tsx */}
				</Grid2>
				{/* ── Row 3 ──── */}
				<Grid2>
					<Typography variant='body1'>
						Need help?&nbsp;
						<Link
							href='#support'
							underline='hover'
							variant='body1'>
							Contact Support
						</Link>
					</Typography>
				</Grid2>
			</Grid2>
		</>
	);
}
