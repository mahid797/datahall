import { NextRequest, NextResponse } from 'next/server';

import { authService, documentService, createErrorResponse } from '@/services';
import { DocumentPatchSchema } from '@/shared/validation/documentSchemas';

/**
 * GET /api/documents/[documentId]
 * Returns metadata for a single doc (ownership enforced).
 */
export async function GET(req: NextRequest, props: { params: Promise<{ documentId: string }> }) {
	try {
		const userId = await authService.authenticate();
		const { documentId } = await props.params;
		const doc = await documentService.getDocumentById(userId, documentId);
		if (!doc) {
			return createErrorResponse('Document not found or access denied.', 404);
		}

		const responsePayload = {
			...doc,
			uploader: {
				name: `${doc.user.firstName} ${doc.user.lastName}`,
				avatar: null,
			},
			links: 0,
			viewers: 0,
			views: 0,
		};

		return NextResponse.json({ document: responsePayload }, { status: 200 });
	} catch (error) {
		return createErrorResponse('Server error while fetching document.', 500, error);
	}
}

/**
 * PATCH /api/documents/[documentId]
 */
export async function PATCH(req: NextRequest, props: { params: Promise<{ documentId: string }> }) {
	const { documentId } = await props.params;
	try {
		const userId = await authService.authenticate();
		const { fileName } = DocumentPatchSchema.parse(await req.json());

		const updatedDoc = await documentService.updateDocument(userId, documentId, {
			fileName,
		});
		if (!updatedDoc) {
			return createErrorResponse('Document not found or access denied.', 404);
		}

		return NextResponse.json(
			{ message: 'Document updated successfully.', document: updatedDoc },
			{ status: 200 },
		);
	} catch (error) {
		return createErrorResponse('Server error while updating document.', 500, error);
	}
}

/**
 * DELETE /api/documents/[documentId]
 */
export async function DELETE(req: NextRequest, props: { params: Promise<{ documentId: string }> }) {
	const { documentId } = await props.params;
	try {
		const userId = await authService.authenticate();

		const deletedDoc = await documentService.deleteDocument(userId, documentId);
		if (!deletedDoc) {
			return createErrorResponse('Document not found or access denied.', 404);
		}

		return NextResponse.json({ message: 'Document deleted successfully.' }, { status: 200 });
	} catch (error) {
		return createErrorResponse('Server error while deleting document.', 500, error);
	}
}
