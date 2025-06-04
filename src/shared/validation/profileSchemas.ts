import { z } from 'zod';
import { PasswordField } from './authSchemas';

export const ChangeNameSchema = z.object({
	firstName: z.string().trim().min(1, 'First name is required'),
	lastName: z.string().trim().min(1, 'Last name is required'),
	email: z.string().email().optional(),
});

export const ChangePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Current password is required'),
		newPassword: PasswordField,
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
export const ChangeNameDefaults = {
	firstName: '',
	lastName: '',
	email: '',
};
export const ChangePasswordDefaults = {
	currentPassword: '',
	newPassword: '',
	confirmPassword: '',
};

export type ChangeNameValues = z.infer<typeof ChangeNameSchema>;
export type ChangePasswordValues = z.infer<typeof ChangePasswordSchema>;
