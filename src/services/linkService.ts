import bcryptjs from 'bcryptjs';
import { randomUUID } from 'crypto';

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

import { SupabaseProvider } from '@/services/storage/supabase/supabaseStorageProvider';
import { buildLinkUrl } from '@/shared/utils/urlBuilder';

export class LinkService {
	/**
	 * Lists all links for a specific document, ensuring ownership.
	 */
	static async getDocumentLinks(userId: string, documentId: string) {
		// Ensure doc ownership
		const doc = await prisma.document.findFirst({
			where: { documentId, userId },
			include: { documentLinks: true },
		});
		if (!doc) return null; // doc not found or no access
		return doc.documentLinks;
	}

	/**
	 * Creates a new link for the specified document if the user owns it.
	 */
	static async createLinkForDocument(
		userId: string,
		documentId: string,
		options: {
			alias?: string;
			isPublic?: boolean;
			password?: string;
			expirationTime?: string;
			visitorFields?: string[];
		},
	) {
		const { alias, isPublic = false, password, expirationTime, visitorFields = [] } = options;
		return prisma.$transaction(async (tx) => {
			// Check doc ownership
			const doc = await tx.document.findFirst({
				where: { documentId, userId },
				select: { documentId: true },
			});
			if (!doc) throw new Error('DOCUMENT_NOT_FOUND');

			// Validate expiration time
			if (expirationTime && new Date(expirationTime) < new Date()) {
				throw new Error('EXPIRATION_PAST');
			}

			// Generate link details
			const slug = randomUUID(); // <- documentLinkId
			const hashedPassword = password ? await bcryptjs.hash(password, 10) : null;

			try {
				const created = await tx.documentLink.create({
					data: {
						documentLinkId: slug,
						documentId: doc.documentId,
						createdByUserId: userId,
						alias: alias?.trim() || null,
						isPublic,
						password: hashedPassword,
						expirationTime: expirationTime ? new Date(expirationTime) : null,
						visitorFields,
					},
				});
				// Return with fresh URL (in case HOST differs by env)
				return { ...created, linkUrl: buildLinkUrl(slug) };
			} catch (err) {
				if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
					// Collision on (documentId, alias)
					throw new Error('LINK_ALIAS_CONFLICT');
				}
				throw err;
			}
		});
	}
	/**
	 * Deletes a link if it belongs to the user.
	 */
	static async deleteLink(userId: string, documentLinkId: string) {
		const link = await prisma.documentLink.findFirst({
			where: { documentLinkId, createdByUserId: userId },
		});

		if (!link) return null; // no access
		return prisma.documentLink.delete({
			where: { documentLinkId: link.documentLinkId },
		});
	}

	/**
	 * Retrieves a link (no user auth required), checks if it exists.
	 * If expired, caller can handle. Returns the raw link record.
	 */
	static async getPublicLink(linkId: string) {
		return prisma.documentLink.findUnique({
			where: { documentLinkId: linkId },
		});
	}

	/**
	 * Verifies a link's password if it exists, returning true if valid or no password.
	 */
	static async verifyLinkPassword(
		link: { password: string | null },
		providedPassword?: string,
	): Promise<boolean> {
		if (!link.password) {
			// No password is set => no check needed
			return true;
		}
		if (!providedPassword) return false;
		const isValid = await bcryptjs.compare(providedPassword, link.password);
		return isValid;
	}

	/**
	 * Logs a new record in LinkVisitors for this link.
	 */
	static async logVisitor(linkId: string, firstName = '', lastName = '', email = '') {
		return prisma.documentLinkVisitor.create({
			data: {
				documentLinkId: linkId,
				firstName,
				lastName,
				email,
			},
		});
	}

	/**
	 * Retrieves all visitors who accessed a specific link under this document.
	 */
	static async getDocumentLinkVisitors(userId: string, documentId: string, linkId: string) {
		// Ensure the link belongs to the specified document and user (i.e., verify ownership)
		const link = await prisma.documentLink.findFirst({
			where: { documentLinkId: linkId, document: { documentId: documentId, userId: userId } },
		});
		if (!link) return null; // link not found or no access

		// Query link visitors
		return prisma.documentLinkVisitor.findMany({
			where: { documentLinkId: linkId },
			orderBy: { visitedAt: 'desc' },
		});
	}

	/**
	 * Generates a signed file URL for the Document associated with this link,
	 * checking if the link is expired. Throws if link invalid/expired.
	 */
	static async getSignedFileFromLink(linkId: string): Promise<{
		signedUrl: string;
		fileName: string;
		size: number;
		fileType: string;
	}> {
		const link = await prisma.documentLink.findUnique({
			where: { documentLinkId: linkId },
			include: { document: true },
		});
		if (!link || !link.document) {
			throw [404, 'Link not found'];
		}
		if (link.expirationTime && new Date(link.expirationTime) < new Date()) {
			throw [410, 'Link has expired'];
		}

		const supabaseProvider = new SupabaseProvider();
		const signedUrl = await supabaseProvider.generateSignedUrl('documents', link.document.filePath);

		return {
			signedUrl,
			fileName: link.document.fileName,
			size: link.document.size,
			fileType: link.document.fileType,
		};
	}
}
