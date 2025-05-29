/**
 * useSignInForm.ts
 * -----------------------------------------------------------------------------
 * Thin wrapper around useFormWithSchema for the /auth/sign-in screen.
 * No extra helpers needed besides the raw RHF API.
 */
import { SignInSchema } from '@/shared/validation/authSchemas';
import { useFormWithSchema } from '@/hooks/forms/useFormWithSchema';
import type { z } from 'zod';

export function useSignInForm(mode: 'onBlur' | 'onChange' | 'onSubmit' = 'onBlur') {
	return useFormWithSchema(SignInSchema, SignInSchema.parse({}), mode);
}

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */
export type SignInFormValues = z.infer<typeof SignInSchema>;
