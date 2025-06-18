'use client';

import { Suspense, useState } from 'react';

import { Box, Button, Divider, Skeleton, Tab, Tabs, Typography } from '@mui/material';

import { useHashTab } from '@/hooks';
import { useAnalyticsQuery, useDocumentDetailQuery } from '@/hooks/data';

import { FileTypeConfig } from '@/shared/config/fileIcons';
import { AnalyticsPeriod, DocumentType } from '@/shared/models';
import { exportToCsv, formatDateTime } from '@/shared/utils';

import CustomBarChart from './CustomBarChart';
import FilterToggle from './FilterToggle';
import InfoTable from './InfoTable';
import { DownloadIcon } from '@/icons';

interface DocumentViewProps {
	documentId: string;
}

const HeadingSkeleton = () => (
	<Box p={5}>
		<Skeleton
			variant='text'
			width={280}
			height={25}
		/>
		<Skeleton
			variant='text'
			width={220}
			height={16}
			sx={{ mt: 2 }}
		/>
	</Box>
);

const ChartSkeleton = () => (
	<Box
		p={5}
		my={5}>
		<Skeleton
			animation='wave'
			variant='rectangular'
			height={350}
			width='100%'
			sx={{ borderRadius: 2 }}
		/>
		<Skeleton
			variant='text'
			width={160}
			height={12}
			sx={{ mt: 2, mx: 'auto' }}
		/>
	</Box>
);

export default function DocumentView({ documentId }: DocumentViewProps) {
	/* ───────── document meta ───────── */
	const {
		data: document,
		isPending: isDocumentLoading,
		error: docError,
	} = useDocumentDetailQuery(documentId);

	/* ───────── analytics ───────── */
	const [period, setPeriod] = useState<AnalyticsPeriod>('7d');
	const {
		data: analytics,
		isPending: isAnalyticsLoading,
		error: analyticsError,
	} = useAnalyticsQuery(documentId, period);

	const { tabKey, setTabKey } = useHashTab('links', ['links', 'visitors'] as const);

	const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
		if (newValue === 'links' || newValue === 'visitors') setTabKey(newValue);
	};

	/* ───────── CSV download handler ───────── */
	const handleExport = () => {
		if (analytics?.buckets.length) {
			exportToCsv(analytics.buckets, `${fileName}-analytics.csv`);
		}
	};

	/* ───────── error states ───────── */
	if (docError || analyticsError) {
		return (
			<Box
				textAlign='center'
				mt={10}>
				<Typography
					variant='h1'
					color='error'>
					{docError?.message ?? analyticsError?.message}
				</Typography>
			</Box>
		);
	}

	if (!isDocumentLoading && !document) {
		return (
			<Box
				textAlign='center'
				mt={10}>
				<Typography
					variant='h1'
					color='text.secondary'>
					Document not found or you have no access.
				</Typography>
			</Box>
		);
	}

	const { fileName = '', fileType = 'General', updatedAt = '' } = (document as DocumentType) || {};

	return (
		<Box>
			{/* Document Heading */}
			{isDocumentLoading ? (
				<HeadingSkeleton />
			) : (
				<Box>
					<Box
						display='flex'
						alignItems='center'>
						<Typography variant='h2'>{fileName}</Typography>
						<Box
							component={FileTypeConfig[fileType] || FileTypeConfig['General']}
							pl={2}
							sx={{ width: 24, height: 24 }}
						/>
					</Box>

					<Typography
						variant='body2'
						component='div'
						display='flex'
						gap={4}
						mt={3}>
						<span>Version&nbsp;1</span>
						<span>-</span>
						<span>Last updated: {formatDateTime(updatedAt)}</span>
					</Typography>
				</Box>
			)}

			{/* Analytics Section */}
			{isAnalyticsLoading ? (
				<ChartSkeleton />
			) : (
				<Box
					p={5}
					my={5}
					border={1}
					borderColor='border.light'
					borderRadius={2}>
					<Box
						display='flex'
						justifyContent='space-between'
						alignItems='center'>
						<FilterToggle
							currentFilter={period}
							onFilterChange={setPeriod}
						/>
						<Button
							variant='contained'
							color='secondary'
							size='small'
							disabled={!analytics?.buckets.length}
							onClick={handleExport}
							endIcon={<DownloadIcon />}
							aria-label='Download analytics CSV'>
							Export Analytics to CSV
						</Button>
					</Box>

					<Box my={{ sm: 1, lg: 2 }}>
						{analytics?.buckets.length ? (
							<CustomBarChart buckets={analytics.buckets} />
						) : (
							<Typography
								variant='body2'
								color='text.secondary'
								textAlign='center'>
								No analytics yet — share this document to start collecting data.
							</Typography>
						)}
					</Box>
				</Box>
			)}

			{/* ───────── Tabs & tables ───────── */}
			<Box mt={{ sm: 1, md: 3, lg: 5 }}>
				<Tabs
					value={tabKey}
					onChange={handleTabChange}
					textColor='primary'
					indicatorColor='primary'>
					<Tab
						value='links'
						label='Links'
						id='links-tab'
					/>
					<Tab
						value='visitors'
						label='Visitors'
						id='visitors-tab'
					/>
				</Tabs>

				<Divider />

				{tabKey === 'links' && (
					<Suspense
						fallback={
							<Skeleton
								variant='rectangular'
								height={260}
								sx={{ my: 4 }}
							/>
						}>
						<Box mt={{ sm: 1, md: 2, lg: 4 }}>
							<InfoTable
								variant='linkTable'
								documentId={documentId}
							/>
						</Box>
					</Suspense>
				)}
				{tabKey === 'visitors' && (
					<Suspense
						fallback={
							<Skeleton
								variant='rectangular'
								height={260}
								sx={{ my: 4 }}
							/>
						}>
						<Box mt={{ sm: 1, md: 2, lg: 4 }}>
							<InfoTable
								variant='visitorTable'
								documentId={documentId}
							/>
						</Box>
					</Suspense>
				)}
			</Box>
		</Box>
	);
}
