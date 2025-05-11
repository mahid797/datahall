import { authService } from '@/app/api/_services/authService';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, props: { params: Promise<{ documentId: string }> }) {
	try {
		const userId = await authService.authenticate();
		const { documentId } = await props.params;

		// Ensure doc belongs to user
		const doc = await prisma.document.findFirst({
			where: { document_id: documentId, user_id: userId },
			include: { documentLink: true },
		});
		if (!doc) {
			return NextResponse.json(
				{ error: 'Document not found or you do not have access.' },
				{ status: 404 },
			);
		}

		// Gather all linkIds
		const linkIds = doc.documentLink.map((l) => l.documentLinkId);
		if (linkIds.length === 0) {
			// No links => no visitors
			return NextResponse.json({ visitors: [] }, { status: 200 });
		}

		// Query LinkVisitors for all those linkIds
		const linkVisitors = await prisma.documentLinkVisitor.findMany({
			where: {
				documentLinkId: { in: linkIds },
			},
			orderBy: { updatedAt: 'desc' },
		});

		const visitors = linkVisitors.map((visitor) => ({
			id: visitor.id,
			documentId: doc.document_id,
			name: `${visitor.firstName} ${visitor.firstName}`.trim(),
			email: visitor.email,
			lastActivity: visitor.updatedAt,
			// These are placeholders for now
			downloads: 0,
			duration: 0,
			completion: 0,
		}));

		return NextResponse.json({ visitors }, { status: 200 });
	} catch (error) {
		return createErrorResponse('Server error.', 500, error);
	}
}

function createErrorResponse(message: string, status: number, details?: any) {
	console.error(`[${new Date().toISOString()}] ${message}`, details);
	return NextResponse.json({ error: message, details }, { status });
}
