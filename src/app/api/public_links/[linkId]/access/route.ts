import { NextRequest, NextResponse } from 'next/server';

import { createErrorResponse, linkService } from '@/services';
import { PublicLinkAccessSchema } from '@/shared/validation/publicLinkSchemas';

/**
 * POST /api/public_links/[linkId]/access
 */
export async function POST(req: NextRequest, props: { params: Promise<{ linkId: string }> }) {
	try {
		const { linkId } = await props.params;
		if (!linkId) {
			return createErrorResponse('Link ID is required.', 400);
		}

		const safeJson = await req.text();
		if (!safeJson) return createErrorResponse('Empty request body', 400);

		const parsedBody = safeJson ? JSON.parse(safeJson) : {};

		const { firstName, lastName, email, password } = PublicLinkAccessSchema.parse(parsedBody);

		// 1) Retrieve link
		const link = await linkService.validateLinkAccess(linkId, password);

		// 2) Log visitor
		if (!link.isPublic) {
			await linkService.logVisitor(linkId, firstName, lastName, email);
		}

		// 3) Get a signed URL for the doc
		try {
			const { fileName, signedUrl, size, fileType } =
				await linkService.getSignedFileFromLink(linkId);
			return NextResponse.json({
				message: 'File access granted',
				data: { signedUrl, fileName, size, documentId: link.documentId, fileType },
			});
		} catch (err) {
			return createErrorResponse('Error retrieving file', 400, err);
		}
	} catch (error) {
		return createErrorResponse('Server error while accessing link', 500, error);
	}
}
