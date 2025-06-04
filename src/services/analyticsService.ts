import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { ServiceError } from './errorService';
import { buildLinkUrl } from '@/shared/utils';
import { AnalyticsEventType } from '@/shared/enums';

export interface AnalyticsEvent {
	documentId: string;
	documentLinkId?: string;
	visitorId?: number;
	eventType: AnalyticsEventType;
	meta?: Prisma.InputJsonValue;
}

export interface AnalyticsSummary {
	totalViews: number;
	totalDownloads: number;
	lastAccessed: string | null;
	documentLinkStats: Array<{
		linkId: string;
		linkAlias?: string | null;
		linkUrl?: string | null;
		lastViewed: string | null;
		lastDownloaded: string | null;
	}>;
}

export const analyticsService = {
	async getAnalyticsForDocument(documentId: string): Promise<AnalyticsSummary> {
		const documentAnalytics = await prisma.documentAnalytics.groupBy({
			by: ['eventType'],
			where: { documentId },
			_count: { eventType: true },
			_max: { timestamp: true },
		});
		let totalViews = 0;
		let totalDownloads = 0;
		let lastAccessed: Date | null = null;

		documentAnalytics.forEach((row) => {
			if (row.eventType === AnalyticsEventType.VIEW) {
				totalViews = row._count.eventType;
			} else if (row.eventType === AnalyticsEventType.DOWNLOAD) {
				totalDownloads = row._count.eventType;
			}
			if (row._max.timestamp && (!lastAccessed || (row._max.timestamp as Date) > lastAccessed)) {
				lastAccessed = row._max.timestamp as Date;
			}
		});

		const linkAnalyticsAggregation = await prisma.documentAnalytics.groupBy({
			by: ['documentLinkId', 'eventType'],
			where: { documentId, NOT: { documentLinkId: null } },
			_max: { timestamp: true },
		});

		const linkAnalyticsMap = new Map<
			string,
			{ lastViewed: string | null; lastDownloaded: string | null }
		>();

		linkAnalyticsAggregation.forEach((row) => {
			const linkId = row.documentLinkId!;
			const currentLinkStats = linkAnalyticsMap.get(linkId) ?? {
				lastViewed: null,
				lastDownloaded: null,
			};

			if (row.eventType === AnalyticsEventType.VIEW) {
				currentLinkStats.lastViewed = row._max.timestamp?.toISOString() ?? null;
			} else {
				currentLinkStats.lastDownloaded = row._max.timestamp?.toISOString() ?? null;
			}
			linkAnalyticsMap.set(linkId, currentLinkStats);
		});

		const documentLinks = await prisma.documentLink.findMany({
			where: { documentId },
			select: { documentLinkId: true, alias: true },
		});

		const links = documentLinks.map((link) => {
			const linkStats = linkAnalyticsMap.get(link.documentLinkId) ?? {
				lastViewed: null,
				lastDownloaded: null,
			};
			return {
				linkId: link.documentLinkId,
				linkAlias: link.alias,
				linkUrl: buildLinkUrl(link.documentLinkId),
				...linkStats,
			};
		});

		return {
			totalViews,
			totalDownloads,
			lastAccessed: lastAccessed ? (lastAccessed as Date).toISOString() : null,
			documentLinkStats: links,
		};
	},

	async getAnalyticsForLink(
		documentId: string,
		linkId: string,
	): Promise<{
		totalViews: number;
		totalDownloads: number;
		lastViewed: string | null;
		lastDownloaded: string | null;
	}> {
		const linkAnalytics = await prisma.documentAnalytics.groupBy({
			by: ['eventType'],
			where: { documentId, documentLinkId: linkId },
			_count: { eventType: true },
			_max: { timestamp: true },
		});

		let totalViews = 0;
		let totalDownloads = 0;
		let lastViewed: string | null = null;
		let lastDownloaded: string | null = null;

		linkAnalytics.forEach((row) => {
			if (row.eventType === AnalyticsEventType.VIEW) {
				totalViews = row._count.eventType;
				lastViewed = row._max.timestamp?.toISOString() ?? null;
			} else if (row.eventType === AnalyticsEventType.DOWNLOAD) {
				totalDownloads = row._count.eventType;
				lastDownloaded = row._max.timestamp?.toISOString() ?? null;
			}
		});

		return { totalViews, totalDownloads, lastViewed, lastDownloaded };
	},

	async logEventForAnalytics(params: AnalyticsEvent) {
		const { documentId, documentLinkId, visitorId, meta, eventType } = params;

		try {
			const analytics = await prisma.documentAnalytics.create({
				data: {
					documentId,
					documentLinkId,
					visitorId,
					eventType,
					meta,
				},
			});

			return analytics;
		} catch (error) {
			console.error('Error logging analytics event:', error);
			throw new ServiceError('Failed to log analytics event', 500);
		}
	},
};
