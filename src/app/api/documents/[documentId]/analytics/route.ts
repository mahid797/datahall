import { NextRequest, NextResponse } from 'next/server';

import { authService, analyticsService, createErrorResponse, documentService } from '@/services';
/**
 * GET /api/documents/[documentId]/analytics
 * Returns analytics for a single doc.
 */
export async function GET(req: NextRequest, props: { params: Promise<{ documentId: string }> }) {
	try {
		const userId = await authService.authenticate();
		const { documentId } = await props.params;

		// Ownership guard
		await documentService.verifyOwnership(userId, documentId);

		const data = await analyticsService.getAnalyticsForDocument(documentId);
		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		return createErrorResponse('Server error while fetching analytics.', 500, error);
	}
}
