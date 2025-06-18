import { NextRequest, NextResponse } from 'next/server';

import { analyticsService, createErrorResponse, linkService } from '@/services';
import { PublicLinkAnalyticsSchema } from '@/shared/validation/publicLinkSchemas';

/**
 * POST /api/public_links/[linkId]/analytics
 * Logs VIEW / DOWNLOAD events – no auth required.
 */

export async function POST(req: NextRequest, props: { params: Promise<{ linkId: string }> }) {
	try {
		const { linkId } = await props.params;
		if (!linkId) {
			return createErrorResponse('Link ID is required.', 400);
		}

		const body = PublicLinkAnalyticsSchema.parse(await req.json());

		// Ensure link exists & not expired
		const link = await linkService.validateLinkAccess(linkId, undefined, {
			skipPasswordCheck: true,
		});

		// Write the analytics row
		await analyticsService.logEventForAnalytics({
			documentId: link.documentId,
			documentLinkId: linkId,
			eventType: body.eventType,
			visitorId: body.visitorId,
			meta: body.meta,
		});

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error) {
		return createErrorResponse('Failed to log analytics.', 500, error);
	}
}
