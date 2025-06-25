import { z } from 'zod';

/**
 * documentAccessSchemas.ts
 * ---------------------------------------------------------------------------
 * Zod schemas + helpers for the visitor-side *document access* flow
 * (formerly “VisitorInfoModal”).  They are built on-demand because the set of
 * required fields (password + visitor fields) is dynamic per link.
 * ---------------------------------------------------------------------------
 */

import { VisitorFieldKey, visitorFieldKeys } from '@/shared/config/visitorFieldsConfig';
import { PASSWORD_RULES } from '@/shared/validation/validationUtils';
import { splitName } from '@/shared/utils/stringUtils';
import type { PublicLinkAccessPayload } from '@/shared/validation/publicLinkSchemas'; // server-side type

/* -------------------------------------------------------------------------- */
/*  Helper: dynamic builder                                                   */
/* -------------------------------------------------------------------------- */

export function buildDocumentAccessFormSchema(
	passwordRequired: boolean,
	visitorFields: VisitorFieldKey[],
) {
	/** -----------------------------------------------------------------------
	 *  Generate the Zod object shape according to runtime flags
	 *  --------------------------------------------------------------------- */
	const shape: Record<string, z.ZodTypeAny> = {};

	/* password */
	if (passwordRequired) {
		shape.password = z
			.string()
			.min(PASSWORD_RULES.MIN_LEN, `Min. ${PASSWORD_RULES.MIN_LEN} characters`);
	}

	/* visitor fields (name, email, …) */
	visitorFields.forEach((key) => {
		if (!visitorFieldKeys.includes(key as any)) return; // ignore invalid keys
		if (key === 'email') {
			shape.email = z.string().email('Invalid e-mail');
		} else {
			// “name” or future keys
			shape[key] = z.string().min(1, 'Required');
		}
	});

	/* --------------------------------------------------------------------- */
	return z.object(shape);
}

/* -------------------------------------------------------------------------- */
/*  Payload transform ⇒ API shape                                             */
/* -------------------------------------------------------------------------- */

export function buildDocumentAccessPayloadSchema(formSchema: z.ZodObject<any>) {
	/**
	 * Transform the *form values* into the backend payload expected by
	 * `POST /public_links/[linkId]/access`
	 */
	return formSchema.transform((vals) => {
		const { password, email, name, ...otherFields } = vals;

		const out: PublicLinkAccessPayload = { ...otherFields };

		/* password (optional) */
		if (password) out.password = password;

		/* e-mail (optional) */
		if (email) out.email = email;

		/* split name into first / last if present */
		if (name) {
			const { firstName, lastName } = splitName(name);
			out.firstName = firstName;
			out.lastName = lastName;
		}

		return out;
	});
}

/* -------------------------------------------------------------------------- */
/*  Defaults helper                                                            */
/* -------------------------------------------------------------------------- */

export function buildDocumentAccessDefaults(
	passwordRequired: boolean,
	visitorFields: VisitorFieldKey[],
) {
	const defaults: Record<string, unknown> = {};
	if (passwordRequired) defaults.password = '';
	visitorFields.forEach((k) => (defaults[k] = ''));
	return defaults;
}

/**
 * Builds a backend-ready payload from raw form values.
 * Ensures splitName logic and empty-string pruning are applied consistently.
 */
export function buildAccessPayload(
	values: z.infer<ReturnType<typeof buildDocumentAccessFormSchema>>,
) {
	return buildDocumentAccessPayloadSchema(buildDocumentAccessFormSchema(false, [])).parse(values);
}
