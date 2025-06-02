import { authService, createErrorResponse, LinkService } from '@/app/api/_services';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/documents/[documentId]/links
 * Returns links for a doc owned by the user.
 */
export async function GET(req: NextRequest, props: { params: Promise<{ documentId: string }> }) {
	try {
		const userId = await authService.authenticate();
		const { documentId } = await props.params;
		const links = await LinkService.getDocumentLinks(userId, documentId);
		if (links === null) {
			return createErrorResponse('Document not found or access denied.', 404);
		}

		const result = links.map((link) => ({
			id: link.id,
			documentId: link.documentId,
			linkId: link.documentLinkId,
			alias: link.alias,
			createdLink: link.linkUrl,
			lastViewed: link.updatedAt,
			linkViews: 0,
		}));

		return NextResponse.json({ links: result }, { status: 200 });
	} catch (error) {
		return createErrorResponse('Server error while fetching links.', 500, error);
	}
}

/**
 * POST /api/documents/[documentId]/links
 * Creates a new link for the doc.
 */
export async function POST(req: NextRequest, props: { params: Promise<{ documentId: string }> }) {
	const params = await props.params;
	try {
		const userId = await authService.authenticate();
		const body = await req.json();

		// Attempt creation
		try {
			const newLink = await LinkService.createLinkForDocument(userId, params.documentId, body);

			if (!newLink) {
				return createErrorResponse('Document not found or access denied.', 404);
			}
			return NextResponse.json(
				{ message: 'Link created successfully.', link: newLink },
				{ status: 201 },
			);
		} catch (createErr) {
			// Check if we threw an "EXPIRATION_PAST" error
			if (createErr instanceof Error && createErr.message === 'EXPIRATION_PAST') {
				return createErrorResponse('Expiration time cannot be in the past.', 400);
			}
			if (createErr instanceof Error && createErr.message === 'FRIENDLY_NAME_CONFLICT') {
				return createErrorResponse('Friendly name is already taken.', 409);
			}
			throw createErr; // rethrow
		}
	} catch (error) {
		return createErrorResponse('Server error while creating link', 500, error);
	}
}
