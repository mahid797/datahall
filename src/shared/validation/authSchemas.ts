/**
 * authSchemas.ts
 * -----------------------------------------------------------------------------
 * Centralised **Zod** definitions for every public-facing authentication form.
 *
 * Keeping all auth-related schemas in one file guarantees:
 *   • A single source of truth for both client-side and server-side validation
 *   • Strongly-typed helper hooks (see the exported `…Values` types)
 *   • Easy re-use from API routes (e.g. `/api/auth/register`) without duplication
 * -----------------------------------------------------------------------------
 */

import { z } from 'zod';
import { PASSWORD_RULES } from '@/shared/validation/validationUtils';

/* -------------------------------------------------------------------------- */
/*  Re-usable primitives                                                      */
/* -------------------------------------------------------------------------- */
/** Normalised e-mail field used by several schemas */
const email = z
	.string({ required_error: 'Email is required' })
	.trim()
	.email('Invalid e-mail address');

/**
 * Our canonical password rule:
 *   – ≥ 8 chars
 *   – ≥ 1 uppercase
 *   – ≥ 1 symbol
 *
 */
const password = z
	.string({ required_error: 'Password is required' })
	.min(PASSWORD_RULES.MIN_LEN, `Must be at least ${PASSWORD_RULES.MIN_LEN} characters long`)
	.regex(PASSWORD_RULES.NEEDS_UPPERCASE, 'Must contain an uppercase letter')
	.regex(PASSWORD_RULES.NEEDS_SYMBOL, 'Must include a symbol');

const emailRequired = z.string().trim().min(1, 'Email is required').email('Invalid e‑mail address');

const passwordRequired = z.string().min(1, 'Password is required');

/* -------------------------------------------------------------------------- */
/*  Page-/route-level schemas                                                 */
/* -------------------------------------------------------------------------- */

/**
 *  /auth/sign-in
 *  -------------
 *  No confirm-password, optional “remember for 30 days” checkbox.
 */
export const SignInSchema = z.object({
	email: emailRequired,
	password: passwordRequired,
	remember: z.boolean().default(false),
});

/**
 *  /auth/sign-up
 *  -------------
 *  Adds confirm-password and basic first/last name requirements.
 *  A `superRefine` is used for cross-field equality check.
 */
export const SignUpSchema = z
	.object({
		firstName: z.string().trim().min(1, 'First name is required'),
		lastName: z.string().trim().min(1, 'Last name is required'),
		email,
		password,
		confirmPassword: z.string(),
	})
	.superRefine(({ password, confirmPassword }, ctx) => {
		if (password !== confirmPassword) {
			ctx.addIssue({
				path: ['confirmPassword'],
				message: 'Passwords do not match',
				code: z.ZodIssueCode.custom,
			});
		}
	});

/**  /auth/forgot-password – only an email field */
export const ForgotPasswordSchema = z.object({ email });

/**
 *  /auth/reset-password
 *  --------------------
 *  Token is supplied via URL param; both new/confirm passwords
 *  must satisfy our canonical rules and match each other.
 */
export const ResetPasswordSchema = z
	.object({
		token: z.string().min(1, 'Missing token'),
		newPassword: password,
		confirmPassword: z.string(),
	})
	.superRefine(({ newPassword, confirmPassword }, ctx) => {
		if (newPassword !== confirmPassword) {
			ctx.addIssue({
				path: ['confirmPassword'],
				message: 'Passwords do not match',
				code: z.ZodIssueCode.custom,
			});
		}
	});

/* -------------------------------------------------------------------------- */
/*  Client-side variant for the reset-password form (no token field)          */
/* -------------------------------------------------------------------------- */
export const ResetPasswordFormSchema = z
	.object({
		newPassword: password,
		confirmPassword: z.string(),
	})
	.superRefine(({ newPassword, confirmPassword }, ctx) => {
		if (newPassword !== confirmPassword) {
			ctx.addIssue({
				path: ['confirmPassword'],
				message: 'Passwords do not match',
				code: z.ZodIssueCode.custom,
			});
		}
	});

/* ───────────────────────────── Default values ────────────────────────────── */

export const signInDefaults: SignInValues = {
	email: '',
	password: '',
	remember: false,
};

export const signUpDefaults: SignUpValues = {
	firstName: '',
	lastName: '',
	email: '',
	password: '',
	confirmPassword: '',
};

export const forgotPasswordDefaults: ForgotPasswordValues = { email: '' };

export const resetPasswordFormDefaults: ResetPasswordFormValues = {
	newPassword: '',
	confirmPassword: '',
};
/* -------------------------------------------------------------------------- */
/*  Derived helper types                                                      */
/* -------------------------------------------------------------------------- */

export type SignInValues = z.infer<typeof SignInSchema>;
export type SignUpValues = z.infer<typeof SignUpSchema>;
export type ForgotPasswordValues = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof ResetPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof ResetPasswordFormSchema>;

export { email as EmailField, password as PasswordField };
