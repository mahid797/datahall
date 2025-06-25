import { useState } from 'react';
import { useWatch } from 'react-hook-form';

import { useFormWithSchema } from '@/hooks/forms/useFormWithSchema';

import {
	buildDocumentAccessDefaults,
	buildDocumentAccessFormSchema,
	buildDocumentAccessPayloadSchema,
} from '@/shared/validation/documentAccessSchemas';
import { VisitorFieldKey } from '@/shared/config/visitorFieldsConfig';

/* -------------------------------------------------------------------------- */
/*  Hook                                                                      */
/* -------------------------------------------------------------------------- */

export function useDocumentAccessForm(
	passwordRequired: boolean,
	visitorFields: VisitorFieldKey[],
	mode: 'onBlur' | 'onChange' | 'onSubmit' = 'onChange',
) {
	/* ── build dynamic schema once ───────────────────────────────────────── */
	const formSchema = buildDocumentAccessFormSchema(passwordRequired, visitorFields);
	const payloadSchema = buildDocumentAccessPayloadSchema(formSchema);
	const defaultValues = buildDocumentAccessDefaults(passwordRequired, visitorFields);

	/* ── initialise RHF state ────────────────────────────────────────────── */
	const form = useFormWithSchema(formSchema, defaultValues, mode);

	/* ── helpers ─────────────────────────────────────────────────────────── */
	const getPayload = () => form.buildPayload(payloadSchema);

	/* simple visibility toggle for password field */
	const [showPassword, setShowPassword] = useState(false);
	const togglePasswordVisibility = () => setShowPassword((p) => !p);

	/* convenient derived values */
	const passwordValue = useWatch({ control: form.control, name: 'password' });
	const isPasswordTouched = !!form.formState.touchedFields.password;

	/* --------------------------------------------------------------------- */
	return {
		...form,
		getPayload,
		showPassword,
		togglePasswordVisibility,
		passwordValue,
		isPasswordTouched,
	};
}

export type DocumentAccessFormValues = ReturnType<typeof buildDocumentAccessDefaults>;
