// src/shared/models/analyticsModels.ts
import { AnalyticsEventType } from '@/shared/enums';
import type { Prisma } from '@prisma/client';

/*─────────────── period filter ───────────────*/
export const ANALYTICS_PERIODS = ['7d', '30d', 'all'] as const;
/** `'all' | '30d' | '7d'` – re-use everywhere */
export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];

export const PERIOD_OPTIONS: readonly {
	value: AnalyticsPeriod;
	label: string;
	aria: string;
}[] = [
	{ value: '7d', label: 'Last 7 days', aria: 'Last 7 days' },
	{ value: '30d', label: 'Last 30 days', aria: 'Last 30 days' },
	{ value: 'all', label: 'All Time', aria: 'All Time' },
] as const;

/*─────────────── payload models ──────────────*/
export interface AnalyticsBucket {
	date: string; // YYYY-MM-DD
	views: number;
	downloads: number;
}

export interface DocumentLinkStat {
	linkId: string;
	linkAlias?: string | null;
	linkUrl: string;
	lastViewed: string | null;
	lastDownloaded: string | null;
}

export interface AnalyticsSummary {
	totalViews: number;
	totalDownloads: number;
	lastAccessed: string | null;
	documentLinkStats: DocumentLinkStat[];
	buckets: AnalyticsBucket[];
}

export interface AnalyticsEvent {
	documentId: string;
	documentLinkId?: string;
	visitorId?: number;
	eventType: AnalyticsEventType;
	meta?: Prisma.InputJsonValue;
}
