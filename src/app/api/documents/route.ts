import { NextRequest, NextResponse } from 'next/server';

import { authService, createErrorResponse, documentService, storageService } from '@/services';
import { buildLinkUrl } from '@/shared/utils';

/**
 * GET /api/documents
 * Returns all documents for the authenticated user.
 */
export async function GET(req: NextRequest) {
	try {
		const userId = await authService.authenticate();
		const documents = await documentService.getUserDocuments(userId);

		const result = documents.map((doc) => {
			const linkCount = doc.documentLinks.length;
			const visitorCount = doc.documentLinks.reduce((acc, l) => acc + l.visitors.length, 0);
			const totalViews = 0; // placeholder

			const createdLinks = doc.documentLinks.map((link) => ({
				linkId: link.documentLinkId,
				createdLink: buildLinkUrl(link.documentLinkId),
				lastViewed: link.updatedAt,
				linkViews: 0,
			}));

			return {
				documentId: doc.documentId,
				fileName: doc.fileName,
				filePath: doc.filePath,
				fileType: doc.fileType,
				size: doc.size,
				createdAt: doc.createdAt.toISOString(),
				updatedAt: doc.updatedAt.toISOString(),
				uploader: {
					name: `${doc.user.firstName} ${doc.user.lastName}`,
					avatar: null,
				},
				links: linkCount,
				viewers: visitorCount,
				views: totalViews,
				createdLinks,
			};
		});

		return NextResponse.json({ documents: result }, { status: 200 });
	} catch (error) {
		return createErrorResponse('Server error while fetching documents', 500, error);
	}
}

/**
 * POST /api/documents
 * Uploads a new document. Expects form data with "file".
 */
export async function POST(req: NextRequest) {
	try {
		const userId = await authService.authenticate();

		const formData = await req.formData();
		const file = formData.get('file');
		if (!(file instanceof File) || !file.name) {
			return createErrorResponse('Invalid file type or missing file', 400);
		}

		// Validate file with environment constraints
		try {
			documentService.validateUploadFile(file);
		} catch (err) {
			if (err instanceof Error) {
				if (err.message === 'INVALID_FILE_TYPE') {
					return createErrorResponse('File type not allowed', 400);
				}
				if (err.message === 'FILE_TOO_LARGE') {
					return createErrorResponse('File size exceeds limit', 400);
				}
			}
			return createErrorResponse('File validation failed', 400, err);
		}

		const arrayBuffer = await file.arrayBuffer();
		const fileBuffer = Buffer.from(arrayBuffer);

		const uploadResult = await storageService.uploadFile(fileBuffer, {
			userId,
			fileName: file.name,
			fileType: file.type,
		});
		if (!uploadResult) {
			return createErrorResponse('File upload failed.', 500);
		}

		const document = await documentService.createDocument({
			userId,
			fileName: file.name,
			filePath: uploadResult,
			fileType: file.type,
			size: file.size,
		});

		return NextResponse.json({ message: 'File uploaded successfully', document }, { status: 200 });
	} catch (error) {
		return createErrorResponse('Server error while uploading document', 500, error);
	}
}
