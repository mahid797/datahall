import { NextRequest, NextResponse } from 'next/server';

import { createErrorResponse, linkService } from '@/services';
import { PublicLinkAccessSchema } from '@/shared/validation/publicLinkSchemas';
import { Prisma } from '@prisma/client';

/**
 * POST /api/public_links/[linkId]/access
 */
export async function POST(req: NextRequest, props: { params: Promise<{ linkId: string }> }) {
	try {
		const { linkId } = await props.params;
		if (!linkId) {
			return createErrorResponse('Link ID is required.', 400);
		}

		/* ---------- parse & validate body ---------- */
		const raw = await req.json().catch(() => ({}));
		const parsed = PublicLinkAccessSchema.parse(raw); // .passthrough() keeps extra fields

		const { password = '', firstName = '', lastName = '', email = '', ...visitorMetaData } = parsed;

		/* cast dynamic fields so Prisma accepts them */
		const jsonMeta: Prisma.InputJsonValue = visitorMetaData as Prisma.InputJsonValue;

		/* ---------- guard: link existence / password / expiry ---------- */
		await linkService.validateLinkAccess(linkId, password);

		/* ---------- optional visitor log (service skips public links) --- */
		const hasVisitorInfo =
			Boolean(firstName || lastName || email) || Object.keys(visitorMetaData).length > 0;

		if (hasVisitorInfo) {
			await linkService.logVisitor(linkId, firstName, lastName, email, jsonMeta);
		}

		/* ---------- signed URL & file meta ------------------------------ */
		const { signedUrl, fileName, size, fileType, documentId } =
			await linkService.getSignedFileFromLink(linkId);

		return NextResponse.json(
			{
				message: 'File access granted',
				data: { signedUrl, fileName, size, fileType, documentId },
			},
			{ status: 200 },
		);
	} catch (error) {
		return createErrorResponse('Server error while accessing link', 500, error);
	}
}
