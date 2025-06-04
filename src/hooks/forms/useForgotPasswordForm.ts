/**
 * useForgotPasswordForm.ts
 * ---------------------------------------------------------------------------
 * Thin RHF+Zod wrapper for the “Forgot password” screen.
 */
import { forgotPasswordDefaults, ForgotPasswordSchema } from '@/shared/validation/authSchemas';
import { useFormWithSchema } from '@/hooks/forms/useFormWithSchema';
import type { z } from 'zod';

export function useForgotPasswordForm(mode: 'onBlur' | 'onChange' | 'onSubmit' = 'onBlur') {
	return useFormWithSchema(ForgotPasswordSchema, forgotPasswordDefaults, mode);
}

/* Derived type (handy for unit tests etc.) */
export type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>;
