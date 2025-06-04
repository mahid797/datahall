import { NextRequest, NextResponse } from 'next/server';
import { analyticsService, authService, createErrorResponse, documentService } from '@/services';

/**
 * GET /api/documents/[documentId]/links/[linkId]/analytics
 * Returns analytics for a single doc for a specific link.
 */
export async function GET(
	req: NextRequest,
	props: { params: Promise<{ documentId: string; linkId: string }> },
) {
	try {
		const userId = await authService.authenticate();
		const { documentId, linkId } = await props.params;

		await documentService.verifyOwnership(userId, documentId);

		const data = await analyticsService.getAnalyticsForLink(documentId, linkId);

		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		return createErrorResponse('Server error while fetching analytics for link.', 500, error);
	}
}
