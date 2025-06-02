// ──────────────────────────────────────────────────────────────────────────────
// validationUtils.ts
// -----------------------------------------------------------------------------
// Centralised helpers & constants that are reused by multiple validation
// layers (Zod schemas *and* UI components).
// -----------------------------------------------------------------------------

/* ============================================================================
   🔐 Password policy — tweak here, every place else updates automatically
   ========================================================================== */

export const PASSWORD_RULES = {
	MIN_LEN: 8, // Minimum number of characters a user password must contain.
	NEEDS_UPPERCASE: /[A-Z]/, // At least one uppercase Latin letter.
	NEEDS_SYMBOL: /[!@#$%^&*(),.?":{}|<>]/, // At least one non-alphanumeric “symbol” character.
} as const;

/** Quick functional helper used by the live <PasswordValidation> component. */
export const getPasswordChecks = (pwd: string) => ({
	isLengthValid: pwd.length >= PASSWORD_RULES.MIN_LEN,
	hasUppercase: PASSWORD_RULES.NEEDS_UPPERCASE.test(pwd),
	hasSymbol: PASSWORD_RULES.NEEDS_SYMBOL.test(pwd),
});

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

/** Splits a comma/space separated string into valid + invalid e-mail arrays. */
export function validateEmails(raw: string) {
	const emails = raw
		.split(/[,\s]+/)
		.map((e) => e.trim())
		.filter(Boolean);

	const validEmails: string[] = [];
	const invalidEmails: string[] = [];

	emails.forEach((email) =>
		EMAIL_REGEX.test(email) ? validEmails.push(email) : invalidEmails.push(email),
	);

	return { validEmails, invalidEmails };
}
