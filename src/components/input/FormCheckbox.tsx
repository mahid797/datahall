'use client';

import { useCallback, useEffect } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { Checkbox, CheckboxProps, FormControlLabel } from '@mui/material';

import { CheckSquareIcon, SquareIcon } from '@/icons';

type ClearTargets = string[];

/* -------------------------------------------------------------------------- */
/* Props                                                                      */
/* -------------------------------------------------------------------------- */
interface FormCheckboxProps extends Omit<CheckboxProps, 'name' | 'checked' | 'onChange' | 'value'> {
	/** RHF field name (required) */
	name: string;
	/** Visible label next to the checkbox */
	label: string;
	/**
	 * Fields to wipe when this checkbox flips **false**.
	 * Useful for auto-clearing password, expiry, etc.
	 */
	clearOnFalse?: ClearTargets;
	/**
	 * Disable logic — static boolean or lazy predicate.
	 * Lazy form avoids “disable in same tick” race conditions.
	 */
	disabledWhen?: boolean | (() => boolean);
	/**
	 * Optional callback fired *after* RHF state updates.
	 * Lets parent components run side-effects without useEffect plumbing.
	 */
	onCheckedChange?: (checked: boolean) => void;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */
export default function FormCheckbox({
	name,
	label,
	clearOnFalse = [],
	disabledWhen,
	onCheckedChange,
	...checkboxProps
}: FormCheckboxProps) {
	const { control, setValue } = useFormContext();

	/* -------------------------------- RHF binding ------------------------- */
	const {
		field: { value = false, onChange, ...fieldRest },
	} = useController({ name, control, defaultValue: false });

	/* ------------------------ clear dependent fields ----------------------- */
	useEffect(() => {
		if (value) return; // only act when toggled OFF
		clearOnFalse.forEach((target) =>
			setValue(target, undefined, {
				shouldValidate: false,
				shouldDirty: false,
				shouldTouch: false,
			}),
		);
	}, [value, clearOnFalse, setValue]);

	/* --------------------------- composite handler ------------------------- */
	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const next = e.target.checked;
			onChange(next); // RHF state
			onCheckedChange?.(next); // external side-effect
		},
		[onChange, onCheckedChange],
	);

	/* ------------------------------ disabled? ------------------------------ */
	const isDisabled = typeof disabledWhen === 'function' ? disabledWhen() : (disabledWhen ?? false);

	/* -------------------------------- render ------------------------------- */
	return (
		<FormControlLabel
			control={
				<Checkbox
					icon={<SquareIcon />}
					checkedIcon={<CheckSquareIcon />}
					checked={Boolean(value)}
					onChange={handleChange}
					disabled={isDisabled || checkboxProps.disabled}
					{...fieldRest} /* name, ref, onBlur */
					{...checkboxProps} /* colour, size, sx, etc. */
				/>
			}
			label={label}
		/>
	);
}
