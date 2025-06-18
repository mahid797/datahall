// prisma/data/analytics.ts
import { faker } from '@faker-js/faker';
import type { AnalyticsEventType, Prisma } from '@prisma/client';

interface VisitorRow {
	id: number;
	documentLinkId: string;
	visitedAt: Date | string;
}

interface Props {
	documents: readonly Prisma.DocumentCreateManyInput[];
	links: readonly Prisma.DocumentLinkCreateManyInput[];
	visitors: readonly VisitorRow[]; // ← has real IDs now
}

/**
 * Builds DocumentAnalytics rows while respecting the unique constraint
 * (visitorId, documentLinkId, eventType, minuteBucket).
 */
export function makeAnalytics({
	documents,
	links,
	visitors,
}: Props): Prisma.DocumentAnalyticsCreateManyInput[] {
	const records: Prisma.DocumentAnalyticsCreateManyInput[] = [];

	/* ------------------------------------------------------------------ */
	/* 0 · De-dup helper – prevents UNIQUE collisions                     */
	/* ------------------------------------------------------------------ */
	/** visitorId|linkId|eventType|minuteBucket(ISO) */
	const seen = new Set<string>();

	const pushUnique = (rec: Prisma.DocumentAnalyticsCreateManyInput): boolean => {
		const key = `${rec.visitorId ?? 'null'}|${rec.documentLinkId ?? 'null'}|${
			rec.eventType
		}|${rec.minuteBucket instanceof Date ? rec.minuteBucket.toISOString() : rec.minuteBucket}`;

		if (seen.has(key)) return false; // duplicate – skip
		seen.add(key);
		records.push(rec);
		return true;
	};

	/* ------------------------------------------------------------------ */
	/* 1 · doc-level buckets                                              */
	/* ------------------------------------------------------------------ */
	documents.forEach((doc) => {
		// spread buckets across four months so 30-day view has data
		const bucket = faker.date.recent({ days: 120 });

		(['VIEW', 'DOWNLOAD'] as AnalyticsEventType[]).forEach((eventType) => {
			const ts = new Date(bucket);
			const maybeVisitor = faker.helpers.maybe(
				() => faker.helpers.arrayElement(visitors),
				{ probability: 0.4 }, // 40 % of doc-level events tied to a visitor
			);

			pushUnique({
				documentId: doc.documentId as string,
				documentLinkId: null, // doc-level ⇢ no link
				visitorId: maybeVisitor?.id ?? null,
				eventType,
				timestamp: ts,
				minuteBucket: new Date(ts.setSeconds(0, 0)),
			});
		});
	});

	/* ------------------------------------------------------------------ */
	/* 2 · link / visitor buckets                                         */
	/* ------------------------------------------------------------------ */
	visitors.forEach((v) => {
		const eventCount = faker.number.int({ min: 1, max: 4 });
		const link = links.find((lnk) => lnk.documentLinkId === v.documentLinkId)!;

		for (let i = 0; i < eventCount; i++) {
			// base ts in the visitor→now window
			let ts = faker.date.between({ from: v.visitedAt as Date, to: new Date() });
			let minuteBucket = new Date(ts.setSeconds(0, 0));
			const eventType = faker.helpers.arrayElement(['VIEW', 'DOWNLOAD']) as AnalyticsEventType;

			/* bump +1 min until the composite key is unique (rarely >1 loop) */
			while (
				!pushUnique({
					documentId: link.documentId as string,
					documentLinkId: v.documentLinkId,
					visitorId: v.id, // always tied to this visitor
					eventType,
					timestamp: ts,
					minuteBucket,
				})
			) {
				ts = new Date(ts.getTime() + 60_000); // +1 minute
				minuteBucket = new Date(ts.setSeconds(0, 0));
			}
		}
	});

	return records;
}
