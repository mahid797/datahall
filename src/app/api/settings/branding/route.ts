import { NextRequest, NextResponse } from 'next/server';

import { authService, brandingService, createErrorResponse } from '@/services';
import { UpdateAccountSettingSchema } from '@/shared/validation/settingSchemas';

/**
 * Handles GET requests to /api/settings/branding.
 *
 * Retrieves the authenticated user's branding settings, including a presigned logo URL.
 *
 * @param req - The incoming Next.js request object.
 * @returns A JSON response containing the user's branding settings.
 */
export async function GET(req: NextRequest) {
	try {
		const userId = await authService.authenticate();

		const setting = await brandingService.getAccountSettings(userId);
		const signedLogo = await brandingService.getSignedLogoUrl(setting.logoUrl);

		return NextResponse.json(
			{
				message: 'Success',
				data: {
					...setting,
					logoUrl: signedLogo, // Replace relative path with signed URL
					createdAt: setting.createdAt.toISOString(),
					updatedAt: setting.updatedAt.toISOString(),
				},
			},
			{ status: 200 },
		);
	} catch (err) {
		return createErrorResponse('Failed to fetch branding settings.', 500, err);
	}
}

/**
 * Handles PATCH requests to /api/settings/branding.
 *
 * Accepts multipart/form-data for updating branding settings:
 *   - Text fields: primaryColor, themePreset, bgPreset, showPersonalInfo, displayName
 *   - File field:  logo (PNG/JPEG/SVG)
 *
 * Validates input, updates the user's branding settings, and returns the updated settings.
 *
 * @param req - The incoming Next.js request object.
 * @returns A JSON response containing the updated branding settings.
 */
export async function PATCH(req: NextRequest) {
	try {
		const userId = await authService.authenticate();
		const formData = await req.formData();

		const updateInput = await brandingService.buildUpdateInput(formData);

		const { logoFile, ...scalarFields } = updateInput;
		UpdateAccountSettingSchema.parse(scalarFields);

		const updated = await brandingService.updateAccountSettings(userId, updateInput);
		const signedLogo = await brandingService.getSignedLogoUrl(updated.logoUrl);

		return NextResponse.json(
			{
				message: 'Settings updated',
				data: {
					...updated,
					logoUrl: signedLogo,
					createdAt: updated.createdAt.toISOString(),
					updatedAt: updated.updatedAt.toISOString(),
				},
			},
			{ status: 200 },
		);
	} catch (err: any) {
		// Bubble up ServiceError codes as-is
		if (err?.status && typeof err.status === 'number') {
			return createErrorResponse(err.message, err.status);
		}
		// Handle Zod validation errors
		if (err?.name === 'ZodError') {
			return NextResponse.json(
				{ message: 'Invalid input', errors: err.flatten() },
				{ status: 400 },
			);
		}
		return createErrorResponse('Failed to update branding settings.', 500, err);
	}
}
