'use client';
import { Skeleton, Stack, Box } from '@mui/material';

/** Generic, responsive skeleton for all loading states */
export default function AccessSkeleton() {
	return (
		<Stack
			spacing={4}
			alignItems='center'
			width='100%'>
			<Skeleton
				variant='text'
				width='60%'
				height={38}
			/>
			<Skeleton
				variant='text'
				width='40%'
				height={28}
			/>
			<Skeleton
				variant='rectangular'
				width='80%'
				height={320}
			/>
			<Box
				display='flex'
				gap={4}>
				<Skeleton
					variant='rectangular'
					width={140}
					height={44}
				/>
				<Skeleton
					variant='rectangular'
					width={140}
					height={44}
				/>
			</Box>
		</Stack>
	);
}
