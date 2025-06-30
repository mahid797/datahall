import { randomUUID } from 'crypto';
import path from 'path';

import prisma from '@/lib/prisma';
import { ServiceError, storageService } from '@/services';

import { THEME_PRESETS, ThemePreset } from '@/shared/config/brandingConfig';
import { emptyToNull, parseBoolean } from '@/shared/utils';

const ASSETS_BUCKET = process.env.SUPABASE_ASSETS_BUCKET || 'assets';
const SIGNED_URL_TTL = Number(process.env.SIGNED_URL_TTL_SECONDS || 60 * 60 * 24 * 7); // 7 days

/**
 * Represents an uploaded branding image.
 */
export type BrandingImage = {
	buffer: Buffer;
	mimeType: string; // e.g. "image/png"
	originalName: string; // Used solely for extension inference
};

/**
 * Input type for updating account branding settings.
 */
export type UpdateSettingsInput = {
	primaryColor?: string;
	themePreset?: ThemePreset | null;
	bgPreset?: 'white' | 'softGrey' | 'tinted';
	showPersonalInfo?: boolean;
	displayName?: string | null;
	logoFile?: BrandingImage;
};

/**
 * Builds the default branding settings, mirroring Prisma defaults.
 * @returns An object containing default branding settings.
 */
function buildDefaultSettings() {
	return {
		primaryColor: '#3f51b5',
		themePreset: null,
		bgPreset: 'white',
		showPersonalInfo: false,
		logoUrl: null,
		displayName: null,
	};
}

/**
 * Service for managing account branding settings, including retrieval,
 * updates, logo uploads, and input parsing.
 */
export const brandingService = {
	/**
	 * Retrieves the account settings for a user, creating defaults if not present.
	 *
	 * @param userId - The user's unique identifier.
	 * @returns The user's account settings object.
	 */
	async getAccountSettings(userId: string) {
		const existing = await prisma.accountSetting.findUnique({ where: { userId } });
		if (existing) return existing;

		// Create default row atomically if not found
		return prisma.accountSetting.upsert({
			where: { userId },
			update: {},
			create: { userId, ...buildDefaultSettings() },
		});
	},

	/**
	 * Updates the account settings for a user, including scalar fields and optional logo file upload.
	 *
	 * @param userId - The user's unique identifier.
	 * @param data - The update input payload containing branding fields and optional logo file.
	 * @returns The updated account settings object.
	 * @throws ServiceError if the theme preset is invalid or image type is not supported.
	 */
	async updateAccountSettings(userId: string, data: UpdateSettingsInput) {
		if (data.themePreset && !THEME_PRESETS.includes(data.themePreset)) {
			throw new ServiceError('Invalid theme preset.', 400);
		}

		const current = await brandingService.getAccountSettings(userId);
		const updates: Record<string, any> = {};

		// Scalar fields
		if (data.primaryColor !== undefined) updates.primaryColor = data.primaryColor;
		if ('themePreset' in data) updates.themePreset = data.themePreset;
		if (data.bgPreset !== undefined) updates.bgPreset = data.bgPreset;
		if (data.showPersonalInfo !== undefined) updates.showPersonalInfo = data.showPersonalInfo;
		if ('displayName' in data) updates.displayName = data.displayName;

		// Logo upload
		if (data.logoFile) {
			const { buffer, mimeType, originalName } = data.logoFile;
			if (!mimeType.startsWith('image/')) {
				throw new ServiceError('INVALID_IMAGE_TYPE', 415);
			}

			const ext = path.extname(originalName) || '.png';
			const objectKey = `logo/${randomUUID()}${ext}`;

			await storageService.uploadFile(
				buffer,
				{
					userId,
					fileName: objectKey,
					fileType: mimeType,
				},
				ASSETS_BUCKET,
			);

			// Delete old logo if one existed
			if (current.logoUrl) await storageService.deleteFile(current.logoUrl, ASSETS_BUCKET);

			updates.logoUrl = `${userId}/${objectKey}`;
		}

		// Database update
		return prisma.accountSetting.update({
			where: { userId },
			data: updates,
		});
	},

	/**
	 * Returns a signed, time-limited URL for the stored logo.
	 * Resolves to `null` when no logo has been set.
	 *
	 * @param relativePath - The relative path to the logo file.
	 * @returns The signed URL as a string, or null if no logo is set.
	 */
	async getSignedLogoUrl(relativePath: string | null) {
		if (!relativePath) return null;
		return storageService.generateSignedUrl(relativePath, SIGNED_URL_TTL, ASSETS_BUCKET);
	},

	/**
	 * Converts an incoming multipart/form-data payload into an UpdateSettingsInput
	 * object understood by the service. Designed for use by the API route.
	 *
	 * @param form - The multipart form data.
	 * @returns The parsed update input object.
	 */
	async buildUpdateInput(form: FormData): Promise<UpdateSettingsInput> {
		const input: UpdateSettingsInput = {};

		// Scalar text fields
		const primaryColor = form.get('primaryColor') as string | null;
		const themePreset = form.get('themePreset') as string | null;
		const bgPreset = form.get('bgPreset') as string | null;
		const personalInfo = form.get('showPersonalInfo') as string | null;
		const displayName = form.get('displayName') as string | null;

		if (primaryColor) input.primaryColor = primaryColor;
		if (themePreset !== null) input.themePreset = emptyToNull(themePreset) as any;
		if (bgPreset) input.bgPreset = bgPreset as any;
		if (personalInfo !== null) input.showPersonalInfo = parseBoolean(personalInfo);
		if (displayName !== null) input.displayName = emptyToNull(displayName);

		// Optional logo file
		const logo = form.get('logo');
		if (logo instanceof File && logo.size > 0) {
			input.logoFile = {
				buffer: Buffer.from(await logo.arrayBuffer()),
				mimeType: logo.type || 'application/octet-stream',
				originalName: logo.name || 'logo',
			};
		}

		return input;
	},
};
