/**
 * useForgotPasswordForm.ts
 * ---------------------------------------------------------------------------
 * Thin RHF+Zod wrapper for the “Forgot password” screen.
 */
import { ForgotPasswordSchema } from '@/shared/validation/authSchemas';
import { useFormWithSchema } from '@/hooks/forms/useFormWithSchema';
import type { z } from 'zod';

export function useForgotPasswordForm(mode: 'onBlur' | 'onChange' | 'onSubmit' = 'onBlur') {
	return useFormWithSchema(ForgotPasswordSchema, ForgotPasswordSchema.parse({}), mode);
}

/* Derived type (handy for unit tests etc.) */
export type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>;
