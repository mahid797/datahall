/**
 * analyticsSchemas.ts
 * -----------------------------------------------------------------------------
 * Zod contracts for analytics-related query-params and HTTP responses.
 */

import { z } from 'zod';
import {
	ANALYTICS_PERIODS,
	AnalyticsPeriod,
	AnalyticsBucket,
	DocumentLinkStat,
} from '@/shared/models/analyticsModels';

/* -------------------------------------------------------------------------- */
/*  Query-param helpers (period filter)                                       */
/* -------------------------------------------------------------------------- */
export const AnalyticsPeriodSchema = z.enum(
	ANALYTICS_PERIODS as unknown as [AnalyticsPeriod, ...AnalyticsPeriod[]],
);

/* -------------------------------------------------------------------------- */
/*  Response contracts                                                        */
/* -------------------------------------------------------------------------- */
export const AnalyticsBucketSchema: z.ZodType<AnalyticsBucket> = z.object({
	date: z.string(), // "2025-06-04"
	views: z.number().int().nonnegative(),
	downloads: z.number().int().nonnegative(),
});

export const DocumentLinkStatSchema: z.ZodType<DocumentLinkStat> = z.object({
	linkId: z.string(),
	linkAlias: z.string().nullable().optional(),
	linkUrl: z.string(),
	lastViewed: z.string().nullable(),
	lastDownloaded: z.string().nullable(),
});

/**
 * Contract returned by
 *   GET /api/documents/[documentId]/analytics
 */
export const DocumentAnalyticsResponseSchema = z.object({
	totalViews: z.number().int().nonnegative(),
	totalDownloads: z.number().int().nonnegative(),
	lastAccessed: z.string().nullable(), // ISO datetime
	documentLinkStats: z.array(DocumentLinkStatSchema),
	buckets: z.array(AnalyticsBucketSchema), // time-series for charts
});

export type DocumentAnalyticsResponse = z.infer<typeof DocumentAnalyticsResponseSchema>;
