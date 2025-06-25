import { z } from 'zod';

import { visitorFieldKeys } from '@/shared/config/visitorFieldsConfig';
/* -------------------------------------------------------------------------- */
/*  UI-level schema – used by react-hook-form                                 */
/* -------------------------------------------------------------------------- */

/** Allowed visitor-field keys (config lists only name & email) */
const VisitorFieldEnum = z.enum(visitorFieldKeys);

const ContactEmail = z.object({
	id: z.number().optional(),
	label: z.string().email('Invalid e-mail'),
});

export const DocumentLinkFormSchema = z
	.object({
		alias: z
			.string()
			.trim()
			.max(255, 'Max 255 characters') // alias is *optional*
			.optional()
			.default(''),

		isPublic: z.boolean().default(false),

		/* visitor info */
		requireUserDetails: z.boolean().default(false),
		visitorFields: z.array(VisitorFieldEnum).default([]),

		/* password */
		requirePassword: z.boolean().default(false),
		password: z.string().optional().default(''),

		/* expiration */
		expirationEnabled: z.boolean().default(false),
		expirationTime: z.string().optional().default(''),

		/* e-mail sharing */
		selectFromContact: z.boolean().default(false),
		contactEmails: z.array(ContactEmail).default([]),

		sendToOthers: z.boolean().default(false),
		otherEmails: z.string().optional().default(''),
	})
	/* ------------- conditional validation rules ------------- */
	.superRefine((val, ctx) => {
		/* password gate */
		if (val.requirePassword && val.password.trim().length < 5) {
			ctx.addIssue({
				path: ['password'],
				code: z.ZodIssueCode.too_small,
				type: 'string',
				minimum: 5,
				inclusive: true,
				message: 'Password must be at least 5 characters',
			});
		}

		/* expiration gate */
		if (val.expirationEnabled && !val.expirationTime) {
			ctx.addIssue({
				path: ['expirationTime'],
				code: z.ZodIssueCode.custom,
				message: 'Expiration date is required',
			});
		}

		/* visitor-details gate */
		if (val.requireUserDetails && val.visitorFields.length === 0) {
			ctx.addIssue({
				path: ['visitorFields'],
				code: z.ZodIssueCode.too_small,
				minimum: 1,
				type: 'array',
				inclusive: true,
				message: 'Select at least one visitor field',
			});
		}

		/* contact list gate */
		if (val.selectFromContact && val.contactEmails.length === 0) {
			ctx.addIssue({
				path: ['contactEmails'],
				code: z.ZodIssueCode.too_small,
				minimum: 1,
				type: 'array',
				inclusive: true,
				message: 'Choose at least one contact',
			});
		}

		/* send-to-others gate */
		if (val.sendToOthers && val.otherEmails.trim() === '') {
			ctx.addIssue({
				path: ['otherEmails'],
				code: z.ZodIssueCode.custom,
				message: 'E-mail list cannot be empty',
			});
		}
	});

/* -------------------------------------------------------------------------- */
/*  Defaults Values                                                           */
/* -------------------------------------------------------------------------- */
export const documentLinkDefaults: z.infer<typeof DocumentLinkFormSchema> =
	DocumentLinkFormSchema.safeParse({}).success
		? (DocumentLinkFormSchema.parse({}) as any)
		: ({} as any);

/* -------------------------------------------------------------------------- */
/*  Payload schema sent to backend                                            */
/* -------------------------------------------------------------------------- */
export const DocumentLinkPayloadSchema = DocumentLinkFormSchema.transform((v) => {
	const p: Record<string, unknown> = {
		alias: v.alias,
		isPublic: v.isPublic,
		expirationEnabled: v.expirationEnabled,
		requirePassword: v.requirePassword,
		requireUserDetails: v.requireUserDetails,
		selectFromContact: v.selectFromContact,
		sendToOthers: v.sendToOthers,
	};

	if (v.expirationEnabled && v.expirationTime) p.expirationTime = v.expirationTime;
	if (v.requirePassword && v.password) p.password = v.password;
	if (v.requireUserDetails) p.visitorFields = v.visitorFields;
	if (v.selectFromContact) p.contactEmails = v.contactEmails;
	if (v.sendToOthers) p.otherEmails = v.otherEmails;

	return p;
});

export type DocumentLinkFormValues = z.infer<typeof DocumentLinkFormSchema>;
export type DocumentLinkPayload = z.infer<typeof DocumentLinkPayloadSchema>;
