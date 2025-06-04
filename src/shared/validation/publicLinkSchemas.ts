import { z } from 'zod';
import { AnalyticsEventType } from '@/shared/enums';
import { Prisma } from '@prisma/client';

/* -------------------------------------------------------------------------- */
/*  POST /public_links/[linkId]/access                                        */
/* -------------------------------------------------------------------------- */
export const PublicLinkAccessSchema = z.object({
	firstName: z.string().trim().default(''),
	lastName: z.string().trim().default(''),
	email: z.preprocess(
		(v) => (v === '' ? undefined : v),
		z.string().email('Invalid email').optional(),
	),
	password: z.string().optional(),
});

/* -------------------------------------------------------------------------- */
/*  POST /public_links/[linkId]/analytics                                     */
/* -------------------------------------------------------------------------- */
export const PublicLinkAnalyticsSchema = z.object({
	eventType: z.nativeEnum(AnalyticsEventType),
	visitorId: z.number().int().optional(),
	meta: z.custom<Prisma.InputJsonValue>().optional(),
});

export type PublicLinkAccessPayload = z.infer<typeof PublicLinkAccessSchema>;
export type PublicLinkAnalyticsPayload = z.infer<typeof PublicLinkAnalyticsSchema>;
