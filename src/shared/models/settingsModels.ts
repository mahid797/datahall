import { ThemePreset, BgPreset } from '@/shared/config/brandingConfig';

/** Row returned by GET /api/settings (mirrors DB) */
export interface AccountSetting {
	userId: string;
	logoUrl: string | null;
	primaryColor: string;
	themePreset: ThemePreset | null;
	bgPreset: BgPreset;
	showPersonalInfo: boolean;
	displayName: string | null;
	updatedAt: string; // ISO
	createdAt: string; // ISO
}

/** Payload accepted by PATCH /api/settings */
export interface UpdateAccountSettingPayload {
	primaryColor?: string;
	themePreset?: ThemePreset | null;
	bgPreset?: BgPreset;
	showPersonalInfo?: boolean;
	displayName?: string | null;
	/** sent as multipart/form-data under field name “logo” */
}
