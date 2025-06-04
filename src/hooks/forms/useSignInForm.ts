/**
 * useSignInForm.ts
 * -----------------------------------------------------------------------------
 * Thin wrapper around useFormWithSchema for the /auth/sign-in screen.
 * No extra helpers needed besides the raw RHF API.
 */
import type { z } from 'zod';
import { useFormWithSchema } from '@/hooks/forms/useFormWithSchema';
import { signInDefaults, SignInSchema } from '@/shared/validation/authSchemas';

export function useSignInForm(mode: 'onBlur' | 'onChange' | 'onSubmit' = 'onBlur') {
	return useFormWithSchema(SignInSchema, signInDefaults, mode);
}
/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
export type SignInFormValues = z.infer<typeof SignInSchema>;
