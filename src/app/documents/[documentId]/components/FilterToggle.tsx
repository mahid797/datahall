import { ToggleButton, ToggleButtonGroup } from '@mui/material';

import { AnalyticsPeriod, PERIOD_OPTIONS } from '@/shared/models/analyticsModels';

interface FilterToggleProps {
	currentFilter: AnalyticsPeriod;
	onFilterChange: (period: AnalyticsPeriod) => void;
}

const FilterToggle = ({ currentFilter, onFilterChange }: FilterToggleProps) => (
	<ToggleButtonGroup
		value={currentFilter}
		exclusive
		aria-label='Analytics period filter'
		onChange={(_, newValue) => {
			if (newValue) onFilterChange(newValue as AnalyticsPeriod);
		}}>
		{PERIOD_OPTIONS.map(({ value, label, aria }) => (
			<ToggleButton
				key={value}
				size='small'
				value={value}
				color='primary'
				aria-label={aria}>
				{label}
			</ToggleButton>
		))}
	</ToggleButtonGroup>
);

export default FilterToggle;
