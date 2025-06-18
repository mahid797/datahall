/**
 * useResetPasswordForm.ts
 * ---------------------------------------------------------------------------
 * RHF + Zod wrapper for the “Reset password” screen.
 * Includes helpers for the live <PasswordValidation/> component.
 */
import { useWatch } from 'react-hook-form';
import {
	resetPasswordFormDefaults,
	ResetPasswordFormSchema,
} from '@/shared/validation/authSchemas';
import { useFormWithSchema } from '@/hooks/forms/useFormWithSchema';
import type { z } from 'zod';

export function useResetPasswordForm(mode: 'onBlur' | 'onChange' | 'onSubmit' = 'onBlur') {
	const form = useFormWithSchema(ResetPasswordFormSchema, resetPasswordFormDefaults, mode);

	/* helpers for PasswordValidation */
	const watchPassword = useWatch({ control: form.control, name: 'newPassword' });
	const isPasswordTouched = !!form.formState.touchedFields.newPassword;

	return { ...form, watchPassword, isPasswordTouched };
}

/* Derived type */
export type ResetPasswordFormValues = z.infer<typeof ResetPasswordFormSchema>;
