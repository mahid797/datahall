import { NextRequest, NextResponse } from 'next/server';

import { authService, createErrorResponse, linkService } from '@/services';

/**
 * DELETE /api/documents/[documentId]/links/[linkId]
 * Removes a link if the user owns it.
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ linkId: string }> }) {
	try {
		const userId = await authService.authenticate();
		const { linkId } = await props.params;
		const deleted = await linkService.deleteLink(userId, linkId);

		if (!deleted) {
			return createErrorResponse('Link not found or access denied.', 404);
		}

		return NextResponse.json({ message: 'Link deleted successfully.' }, { status: 200 });
	} catch (error) {
		return createErrorResponse('Server error while deleting link.', 500, error);
	}
}
