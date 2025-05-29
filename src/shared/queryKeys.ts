/**
 * queryKeys.ts
 * -----------------------------------------------------------------------------
 * Canonical keys for TanStack Query.
 *
 *  ›  Import from here—never hard-code strings in hooks or components.
 *  ›  Array shape is always:  [domain, id? , subresource?]
 * -----------------------------------------------------------------------------
 */

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
	},

	/* ------------------------------------------------------------------------ */
	/*  Public or secure links                                                  */
	/* ------------------------------------------------------------------------ */
	links: {
		/** Visitor access tracking for a link */
		access: (linkId: string) => ['links', linkId, 'access'] as const,
	},
} as const;
