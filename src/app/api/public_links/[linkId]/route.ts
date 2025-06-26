import { NextRequest, NextResponse } from 'next/server';

import { createErrorResponse, linkService } from '@/services';

/**
 * GET /api/public_links/[linkId]
 * Returns password / visitor-field requirements and,
 * for truly-public links, an immediate signed URL + file meta.
 */
export async function GET(req: NextRequest, props: { params: Promise<{ linkId: string }> }) {
	try {
		const { linkId } = await props.params;
		if (!linkId) {
			return createErrorResponse('Link ID is required.', 400);
		}

		const meta = await linkService.getLinkMeta(linkId);

		return NextResponse.json({ message: 'Link is valid', data: meta }, { status: 200 });
	} catch (error) {
		return createErrorResponse('Server error while fetching link.', 500, error);
	}
}
