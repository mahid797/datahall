/**
 * queryKeys.ts
 * -----------------------------------------------------------------------------
 * Canonical keys for TanStack Query.
 *
 *  ›  Import from here—never hard-code strings in hooks or components.
 *  ›  Array shape is always:  [domain, id? , subresource?]
 * -----------------------------------------------------------------------------
 */

import type { AnalyticsPeriod } from '@/shared/models/analyticsModels';

export const queryKeys = {
	/* ------------------------------------------------------------------------ */
	/*  Profile                                                                 */
	/* ------------------------------------------------------------------------ */
	profile: {
		base: ['profile'] as const,
	},

	/* ------------------------------------------------------------------------ */
	/*  Contacts                                                                */
	/* ------------------------------------------------------------------------ */
	contacts: {
		base: ['contacts'] as const,
	},

	/* ------------------------------------------------------------------------ */
	/*  Documents & nested resources                                            */
	/* ------------------------------------------------------------------------ */
	documents: {
		/** Entire collection – used by list / table views */
		all: ['documents'] as const,

		/** Single document detail */
		detail: (documentId: string) => ['documents', documentId] as const,

		/** Links that belong to a document */
		links: (documentId: string) => ['documents', documentId, 'links'] as const,

		/** Visitors for a document */
		visitors: (documentId: string) => ['documents', documentId, 'visitors'] as const,

		/** Owner-side aggregate analytics for a document */
		analytics: (documentId: string, period: AnalyticsPeriod = 'all') =>
			['documents', documentId, 'analytics', period] as const,

		/** Owner-side analytics for a single link */
		linkAnalytics: (documentId: string, linkId: string) =>
			['documents', documentId, 'links', linkId, 'analytics'] as const,
	},

	/* ------------------------------------------------------------------------ */
	/*  Public or secure links                                                  */
	/* ------------------------------------------------------------------------ */
	links: {
		/** Visitor access tracking for a link */
		access: (linkId: string) => ['links', linkId, 'access'] as const,

		/** Visitor-side analytics logging / invalidation */
		analytics: (linkId: string) => ['links', linkId, 'analytics'] as const,

		/** Visitor-side analytics for a single link */
		visitors: (linkId: string) => ['links', linkId, 'visitors'] as const,
	},
} as const;
