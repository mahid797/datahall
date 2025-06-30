import prisma from '@/lib/prisma';

import { ServiceError } from '@/services';

import { AnalyticsEventType } from '@/shared/enums';
import type {
	AnalyticsBucket,
	AnalyticsEvent,
	AnalyticsPeriod,
	AnalyticsSummary,
	DocumentLinkStat,
} from '@/shared/models/analyticsModels';
import { buildLinkUrl } from '@/shared/utils';

/* -------------------------------------------------------------------------- */
/*  Service (PUBLIC)                                                          */
/* -------------------------------------------------------------------------- */
export const analyticsService = {
	/**
	 * Returns overall analytics summary, per-link statistics, and time-series buckets for a document.
	 *
	 * @param documentId - The document ID to fetch analytics for.
	 * @param period - The analytics period ('all' | '30d' | '7d'). Defaults to 'all'.
	 * @returns An AnalyticsSummary object containing totals, per-link stats, and time-series buckets.
	 * @throws ServiceError if the document does not exist or belongs to another user.
	 */
	async getAnalyticsForDocument(
		documentId: string,
		period: AnalyticsPeriod = 'all',
	): Promise<AnalyticsSummary> {
		const [totals, linkStats, buckets] = await Promise.all([
			getDocumentTotals(documentId),
			getPerLinkStats(documentId),
			getTimeSeriesBuckets(documentId, period),
		]);

		return {
			totalViews: totals.totalViews,
			totalDownloads: totals.totalDownloads,
			lastAccessed: totals.lastAccessed ? totals.lastAccessed.toISOString() : null,
			documentLinkStats: linkStats,
			buckets,
		};
	},

	/**
	 * Returns analytics summary for a specific link within a document.
	 *
	 * @param documentId - The document ID to fetch analytics for.
	 * @param linkId - The specific link ID to fetch analytics for.
	 * @returns An object summarizing total views, downloads, and last access times for the link.
	 */
	async getAnalyticsForLink(documentId: string, linkId: string) {
		const rows = await prisma.documentAnalytics.groupBy({
			by: ['eventType'],
			where: { documentId, documentLinkId: linkId },
			_count: { eventType: true },
			_max: { timestamp: true },
		});

		const linkAnalyticsSummary = {
			totalViews: 0,
			totalDownloads: 0,
			lastViewed: null as string | null,
			lastDownloaded: null as string | null,
		};

		for (const row of rows) {
			if (row.eventType === AnalyticsEventType.VIEW) {
				linkAnalyticsSummary.totalViews = row._count.eventType;
				linkAnalyticsSummary.lastViewed = row._max.timestamp?.toISOString() ?? null;
			} else {
				linkAnalyticsSummary.totalDownloads = row._count.eventType;
				linkAnalyticsSummary.lastDownloaded = row._max.timestamp?.toISOString() ?? null;
			}
		}
		return linkAnalyticsSummary;
	},

	/**
	 * Logs an analytics event for a document.
	 *
	 * @param params - The analytics event parameters.
	 * @returns The created analytics record.
	 * @throws ServiceError if logging fails.
	 */
	async logEventForAnalytics(params: AnalyticsEvent) {
		try {
			const analytics = await prisma.documentAnalytics.create({ data: params });
			return analytics;
		} catch (error) {
			console.error('Error logging analytics event:', error);
			throw new ServiceError('Failed to log analytics event', 500);
		}
	},
};

/* -------------------------------------------------------------------------- */
/*  Helper functions (PRIVATE)                                                */
/* -------------------------------------------------------------------------- */

/**
 * Fetches total views, downloads, and last accessed timestamp for a document.
 *
 * @param documentId - The document ID to log analytics for.
 * @returns An object containing total views, downloads, and last accessed timestamp.
 * @throws ServiceError if the document does not exist or belongs to another user.
 */
async function getDocumentTotals(documentId: string) {
	const rows = await prisma.documentAnalytics.groupBy({
		by: ['eventType'],
		where: { documentId },
		_count: { eventType: true },
		_max: { timestamp: true },
	});

	let totalViews = 0;
	let totalDownloads = 0;
	let lastAccessed: Date | null = null;

	for (const row of rows) {
		if (row.eventType === AnalyticsEventType.VIEW) {
			totalViews = row._count.eventType;
		} else {
			totalDownloads = row._count.eventType;
		}

		if (row._max.timestamp && (!lastAccessed || row._max.timestamp > lastAccessed)) {
			lastAccessed = row._max.timestamp;
		}
	}

	return { totalViews, totalDownloads, lastAccessed };
}

/**
 * Fetches per-link statistics for a document, including last viewed/downloaded timestamps.
 *
 * @param documentId - The document ID to fetch link stats for.
 * @returns An array of DocumentLinkStat objects containing link stats.
 */
async function getPerLinkStats(documentId: string): Promise<DocumentLinkStat[]> {
	// Aggregate per link
	const perLinkAggregation = await prisma.documentAnalytics.groupBy({
		by: ['documentLinkId', 'eventType'],
		where: { documentId, NOT: { documentLinkId: null } },
		_max: { timestamp: true },
	});

	const map = new Map<string, { lastViewed: string | null; lastDownloaded: string | null }>();

	perLinkAggregation.forEach((row) => {
		const linkId = row.documentLinkId!;
		const current = map.get(linkId) ?? {
			lastViewed: null,
			lastDownloaded: null,
		};

		if (row.eventType === AnalyticsEventType.VIEW) {
			current.lastViewed = row._max.timestamp?.toISOString() ?? null;
		} else {
			current.lastDownloaded = row._max.timestamp?.toISOString() ?? null;
		}
		map.set(linkId, current);
	});

	// Join with link metadata (alias)
	const links = await prisma.documentLink.findMany({
		where: { documentId },
		select: { documentLinkId: true, alias: true },
	});

	return links.map((link) => {
		const stats = map.get(link.documentLinkId) ?? {
			lastViewed: null,
			lastDownloaded: null,
		};
		return {
			linkId: link.documentLinkId,
			linkAlias: link.alias,
			linkUrl: buildLinkUrl(link.documentLinkId),
			...stats,
		};
	});
}

/**
 * Fetches time-series buckets of views and downloads for a document.
 *
 * @param documentId - The document ID to fetch time-series data for.
 * @param period - The analytics period ('all' | '30d' | '7d'). Defaults to 'all'.
 * @returns An array of AnalyticsBucket objects containing date, views, and downloads.
 */
async function getTimeSeriesBuckets(
	documentId: string,
	period: 'all' | '30d' | '7d',
): Promise<AnalyticsBucket[]> {
	const analyticsStartTime =
		period === 'all' ? undefined : new Date(Date.now() - (period === '30d' ? 30 : 7) * 86_400_000);

	const rows = await prisma.documentAnalytics.groupBy({
		by: ['minuteBucket', 'eventType'],
		where: {
			documentId,
			...(analyticsStartTime ? { minuteBucket: { gte: analyticsStartTime } } : {}),
		},
		_count: { eventType: true },
	});

	const analyticsBucketMap = new Map<string, { views: number; downloads: number }>();

	rows.forEach((row) => {
		const bucketDate = row.minuteBucket.toISOString().slice(0, 10); // YYYY-MM-DD
		const analyticsRecord = analyticsBucketMap.get(bucketDate) ?? { views: 0, downloads: 0 };

		if (row.eventType === AnalyticsEventType.VIEW) {
			analyticsRecord.views += row._count.eventType;
		} else {
			analyticsRecord.downloads += row._count.eventType;
		}
		analyticsBucketMap.set(bucketDate, analyticsRecord);
	});

	return Array.from(analyticsBucketMap.entries()).map(([date, eventCounts]) => ({
		date,
		views: eventCounts.views,
		downloads: eventCounts.downloads,
	}));
}
