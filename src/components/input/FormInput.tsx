import React, { forwardRef } from 'react';

import { TextField, TextFieldProps, Typography } from '@mui/material';

type RHFRegisterProps = {
	name?: string;
	onChange?: (...e: any[]) => void;
	onBlur?: (...e: any[]) => void;
	ref?: React.Ref<HTMLInputElement>;
};

interface FormInputProps
	extends Omit<TextFieldProps, 'error' | 'helperText' | 'name' | 'onChange' | 'onBlur' | 'ref'>,
		RHFRegisterProps {
	/** Input label shown above the field */
	label?: string;
	/** Unique identifier for the input */
	id?: string;
	/** Error message to display below the input */
	errorMessage?: string;
	/** Minimum width of the input field */
	minWidth?: number;
	/** Minimum height of the error message area */
	minHeight?: number;
}

/**
 * Reusable MUI text input that works with BOTH
 * – controlled props (value / onChange)  *and*
 * – react-hook-form’s register spread (name / onChange / ref).
 */
const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
	(
		{
			label,
			id,
			errorMessage = '',
			minWidth,
			minHeight = '1.5em',
			fullWidth = true,
			size = 'small',
			...props
		},
		ref,
	) => {
		const fieldName = props.name ?? id;
		const showError = Boolean(errorMessage);

		return (
			<>
				{label && (
					<Typography
						variant='h3'
						mb={4}>
						{label}
					</Typography>
				)}

				<TextField
					{...props}
					id={id ?? fieldName}
					name={fieldName}
					size={size}
					fullWidth={fullWidth}
					inputRef={ref}
					error={showError}
					{...(showError && { helperText: errorMessage })}
					slotProps={{
						formHelperText: {
							sx: { minHeight: showError ? minHeight : '0em' },
						},
					}}
					autoComplete={props.type === 'password' ? 'new-password' : undefined}
					sx={{ minWidth, ...props.sx }}
				/>
			</>
		);
	},
);

FormInput.displayName = 'FormInput';
export default FormInput;
