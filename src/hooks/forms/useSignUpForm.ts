/**
 * useSignUpForm.ts
 * -----------------------------------------------------------------------------
 * Handles extra convenience state used by the live <PasswordValidation> meter.
 */

import { useWatch } from 'react-hook-form';
import { signUpDefaults, SignUpSchema } from '@/shared/validation/authSchemas';
import { useFormWithSchema } from '@/hooks/forms/useFormWithSchema';
import type { z } from 'zod';

export function useSignUpForm(mode: 'onBlur' | 'onChange' | 'onSubmit' = 'onBlur') {
	const form = useFormWithSchema(SignUpSchema, signUpDefaults, mode);

	/* Derive helpers consumed by PasswordValidation component */
	const watchPassword = useWatch({ control: form.control, name: 'password' });
	const isPasswordTouched = !!form.formState.touchedFields.password;

	return { ...form, watchPassword, isPasswordTouched };
}

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
export type SignUpFormValues = z.infer<typeof SignUpSchema>;
