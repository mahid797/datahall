import prisma from '@/lib/prisma';
import { deleteFile } from '@/services';
import { ServiceError } from './errorService';

export const documentService = {
	/**
	 * Returns all documents (and relevant info) for the specified user.
	 */
	async getUserDocuments(userId: string) {
		return prisma.document.findMany({
			where: { userId },
			include: {
				user: {
					select: { firstName: true, lastName: true },
				},
				documentLinks: {
					include: { visitors: true },
				},
			},
			orderBy: { createdAt: 'desc' },
		});
	},

	/**
	 * Creates a new document record for the given user.
	 */
	async createDocument({
		userId,
		fileName,
		filePath,
		fileType,
		size,
	}: {
		userId: string;
		fileName: string;
		filePath: string;
		fileType: string;
		size: number;
	}) {
		return prisma.document.create({
			data: {
				userId,
				fileName,
				filePath,
				fileType,
				size,
			},
		});
	},

	/**
	 * Fetch a single document by ID, ensuring it belongs to the given user.
	 */
	async getDocumentById(userId: string, documentId: string) {
		return prisma.document.findFirst({
			where: { documentId, userId },
			select: {
				id: true,
				documentId: true,
				fileName: true,
				filePath: true,
				fileType: true,
				size: true,
				createdAt: true,
				updatedAt: true,
				user: {
					select: { firstName: true, lastName: true },
				},
			},
		});
	},

	/**
	 * Updates a document if owned by the user, returning the updated record.
	 */
	async updateDocument(userId: string, documentId: string, data: { fileName?: string }) {
		// Ensure the document is owned by user
		const existingDoc = await prisma.document.findUnique({
			where: { documentId },
		});
		if (!existingDoc || existingDoc.userId !== userId) {
			return null; // signals "not found or no access"
		}

		return prisma.document.update({
			where: { documentId },
			data: {
				fileName: data.fileName ?? existingDoc.fileName,
			},
		});
	},

	/**
	 * Deletes a document and its file from storage if the user owns it.
	 */
	async deleteDocument(userId: string, documentId: string) {
		// Check ownership
		const document = await prisma.document.findUnique({
			where: { documentId },
		});
		if (!document || document.userId !== userId) {
			return null; // signals "not found or no access"
		}

		// Delete from DB
		const deletedDoc = await prisma.document.delete({
			where: { documentId },
		});

		// Delete from storage
		await deleteFile(deletedDoc.filePath);

		return deletedDoc;
	},

	/**
	 * Retrieves all visitors who accessed any link under this document.
	 */
	async getDocumentVisitors(userId: string, documentId: string) {
		// Ensure doc ownership
		const doc = await prisma.document.findFirst({
			where: { documentId, userId },
			include: { documentLinks: true },
		});
		if (!doc) return null; // doc not found or no access

		// Gather linkIds
		const linkIds = doc.documentLinks.map((l) => l.documentLinkId);
		if (linkIds.length === 0) {
			return [];
		}

		// Query link visitors
		return prisma.documentLinkVisitor.findMany({
			where: { documentLinkId: { in: linkIds } },
			orderBy: { updatedAt: 'desc' },
		});
	},

	/**
	 * Verifies that the document identified by documentId is owned by userId.
	 * Throws a ServiceError with status 404 if not found or if access is denied.
	 *
	 * @param userId - The ID of the current user.
	 * @param documentId - The document identifier.
	 * @returns A promise that resolves if ownership is validated.
	 */
	async verifyOwnership(userId: string, documentId: string): Promise<void> {
		const document = await prisma.document.findFirst({
			where: { documentId, userId },
			select: { documentId: true },
		});

		if (!document) {
			throw new ServiceError('Document not found or access denied.', 404);
		}
	},

	/**
	 * Validates file type & size against env variables:
	 * - ALLOWED_FILE_TYPES (comma-separated, e.g. "pdf,jpg,png")
	 * - MAX_FILE_SIZE_MB (e.g. "1" => 1 MB)
	 */
	validateUploadFile(file: File) {
		// 1) Validate MIME type based on ALLOWED_FILE_TYPES
		const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [];
		if (!allowedTypes.includes(file.type)) {
			throw new ServiceError('INVALID_FILE_TYPE', 400);
		}

		// 2) Validate file size
		const maxSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '1', 10);
		const fileSizeMB = file.size / (1024 * 1024);
		if (fileSizeMB > maxSizeMB) {
			throw new ServiceError('FILE_TOO_LARGE', 413);
		}
	},
};
