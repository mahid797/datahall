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

export const DocumentLinkFormSchema = z.object({
	alias: z
		.string()
		.trim()
		.max(255, 'Max 255 characters') // alias is *optional*
		.optional()
		.default(''),
	isPublic: z.boolean().default(true),

	/* visitor info */
	requireUserDetails: z.boolean().default(false),
	visitorFields: z.array(VisitorFieldEnum).default([]),

	/* password-protect */
	requirePassword: z.boolean().default(false),
	password: z.string().min(5, 'Min. 5 characters').optional().or(z.literal('')),

	/* expiration */
	expirationEnabled: z.boolean().default(false),
	expirationTime: z.string().datetime().optional().or(z.literal('')),

	/* e-mail sharing */
	selectFromContact: z.boolean().default(false),
	contactEmails: z.array(ContactEmail).default([]),

	sendToOthers: z.boolean().default(false),
	otherEmails: z.string().optional().or(z.literal('')),
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
