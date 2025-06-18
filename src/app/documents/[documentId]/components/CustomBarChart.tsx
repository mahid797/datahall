'use client';

import { memo } from 'react';
import dayjs from 'dayjs';
import { BarChart } from '@mui/x-charts/BarChart';

import { AnalyticsBucket } from '@/shared/models/analyticsModels';

interface CustomBarChartProps {
	buckets: AnalyticsBucket[];
}

function CustomBarChart({ buckets }: CustomBarChartProps) {
	// Create a dataset array with index signature for each bucket
	const dataset = buckets.map((b) => ({
		date: b.date,
		views: b.views,
		downloads: b.downloads,
		max: Math.max(b.views),
	}));

	if (!dataset.length) return null;

	const categoryGapRatio = dataset.length <= 7 ? 0.4 : 0.1;
	return (
		<BarChart
			// width={1230}
			height={300}
			sx={{ width: '100%' }}
			dataset={dataset}
			xAxis={[
				{
					scaleType: 'band',
					data: dataset.map((d) => d.date),
					label: 'Date',
					categoryGapRatio: categoryGapRatio,
					barGapRatio: 0,
					valueFormatter: (v: string) =>
						dataset.length > 60 // crude “all time” heuristic
							? dayjs(v).format('YYYY-MM')
							: dayjs(v).format('MMM DD'),
					tickMinStep: Math.ceil(dataset.length / 8),
				},
			]}
			yAxis={[
				{
					scaleType: 'linear',
					label: 'Count',
					min: 0,
					tickMinStep: 1,
				},
			]}
			series={[
				{ dataKey: 'views', label: 'Views', color: '#01AFFF' },
				{ dataKey: 'downloads', label: 'Downloads', color: '#1570EF' },
			]}
			slotProps={{
				legend: {
					direction: 'horizontal',
					position: { vertical: 'bottom', horizontal: 'center' },
					sx: {
						'& .MuiChartLegend-label': {
							fontSize: 14,
							fontWeight: 500,
						},
						gap: 32,
					},
				},
			}}
			margin={{ top: 10 }}
		/>
	);
}

export default memo(CustomBarChart);
