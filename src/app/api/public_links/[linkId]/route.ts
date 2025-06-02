import { NextRequest, NextResponse } from 'next/server';

import { linkService, createErrorResponse } from '@/services';

/**
 * GET /api/public_links/[linkId]
 */
export async function GET(req: NextRequest, props: { params: Promise<{ linkId: string }> }) {
	try {
		const { linkId } = await props.params;
		if (!linkId) {
			return createErrorResponse('Link ID is required.', 400);
		}

		const link = await linkService.validateLinkAccess(linkId, undefined, {
			skipPasswordCheck: true,
		});

		// If link is public, we see if it requires user details or password
		const isPasswordProtected = !!link.password;
		const visitorFields = link.visitorFields;

		return NextResponse.json(
			{
				message: 'Link is valid',
				data: {
					isPasswordProtected,
					visitorFields,
				},
			},
			{ status: 200 },
		);
	} catch (error) {
		return createErrorResponse('Server error while fetching link.', 500, error);
	}
}
