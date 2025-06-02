import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '../_services/authService';

export async function GET(req: NextRequest): Promise<NextResponse> {
	try {
		const userId = await authService.authenticate();

		const userLinks = await prisma.documentLink.findMany({
			where: { createdByUserId: userId },
			select: { documentLinkId: true },
		});
		if (!userLinks.length) {
			return NextResponse.json({ data: [] }, { status: 200 });
		}

		const linkIds = userLinks.map((l) => l.documentLinkId);

		const visitors = await prisma.documentLinkVisitor.groupBy({
			by: ['email'],
			where: {
				documentLinkId: { in: linkIds },
			},
			_count: {
				email: true,
			},
			_max: {
				updatedAt: true,
			},
		});

		const visitorDetails = await Promise.all(
			visitors.map(async (visitor) => {
				const lastVisit = await prisma.documentLinkVisitor.findFirst({
					where: {
						email: visitor.email,
						documentLinkId: { in: linkIds },
					},
					orderBy: { updatedAt: 'desc' },
					include: {
						documentLink: true,
					},
				});

				if (!lastVisit) {
					return null;
				}

				const firstName = lastVisit.firstName?.trim() || null;
				const lastName = lastVisit.lastName?.trim() || null;
				const fullName =
					firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : null;

				return {
					id: lastVisit.id,
					name: fullName,
					email: visitor.email || null,
					lastViewedLink: lastVisit.documentLink?.alias || lastVisit.documentLink?.linkUrl || null,
					lastActivity: lastVisit.updatedAt || null,
					totalVisits: visitor._count.email || 0,
				};
			}),
		);

		const contacts = visitorDetails.filter(Boolean);

		return NextResponse.json({ data: contacts }, { status: 200 });
	} catch (error) {
		return createErrorResponse('Server error.', 500, error);
	}
}

function createErrorResponse(message: string, status: number, details?: any) {
	console.error(`[${new Date().toISOString()}] ${message}`, details);
	return NextResponse.json({ error: message, details }, { status });
}
