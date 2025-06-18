/**
 * useChangePasswordForm.ts
 * ---------------------------------------------------------------------------
 * State + helpers for the **Change Password** modal.
 * Encapsulates:
 *   • RHF form state (ChangePasswordSchema)
 *   • Per-field password visibility toggles
 *   • Convenience accessors (`watchNewPassword`, `isTouched`)
 * ---------------------------------------------------------------------------
 */

import { useState } from 'react';
import { useWatch } from 'react-hook-form';

import { ChangePasswordDefaults, ChangePasswordSchema } from '@/shared/validation/profileSchemas';
import { useFormWithSchema } from '@/hooks/forms/useFormWithSchema';
import type { z } from 'zod';

/* -------------------------------------------------------------------------- */
/*  Password visibility helpers                                               */
/* -------------------------------------------------------------------------- */

type PasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword';

export function useChangePasswordForm(mode: 'onBlur' | 'onChange' | 'onSubmit' = 'onBlur') {
	const form = useFormWithSchema(ChangePasswordSchema, ChangePasswordDefaults, mode);

	/* Local UI state – show / hide password inputs per field */
	const [visible, setVisible] = useState<Record<PasswordField, boolean>>({
		currentPassword: false,
		newPassword: false,
		confirmPassword: false,
	});

	function toggleVisibility(field: PasswordField) {
		setVisible((prev) => ({ ...prev, [field]: !prev[field] }));
	}

	/* Convenience derived state for <PasswordValidation /> component */
	const watchNewPassword = useWatch({
		control: form.control,
		name: 'newPassword',
	});
	const isNewPasswordTouched = !!form.formState.touchedFields.newPassword;

	return {
		...form,
		visible,
		toggleVisibility,
		watchNewPassword,
		isNewPasswordTouched,
	};
}

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export type ChangePasswordFormValues = z.infer<typeof ChangePasswordSchema>;
