import { z } from 'zod';
import { THEME_PRESETS, BG_PRESETS, BgPreset, ThemePreset } from '@/shared/config/brandingConfig';
import { AccountSetting, UpdateAccountSettingPayload } from '@/shared/models';

const ThemeEnum = z.enum([...THEME_PRESETS] as [ThemePreset, ...ThemePreset[]]);
const BgEnum = z.enum([...BG_PRESETS] as [BgPreset, ...BgPreset[]]);

/* ------------------ PATCH payload schema ------------------ */
export const UpdateAccountSettingSchema: z.ZodType<UpdateAccountSettingPayload> = z.object({
	primaryColor: z
		.string()
		.regex(/^#?([0-9a-fA-F]{3}){1,2}$/, 'Invalid HEX colour')
		.optional(),
	themePreset: ThemeEnum.nullable().optional(),
	bgPreset: BgEnum.optional(),
	showPersonalInfo: z.boolean().optional(),
	displayName: z.string().max(40).nullable().optional(),
	/* logo image handled via multipart file; not present in JSON body */
});

/* ------------------ GET response schema ------------------- */
export const AccountSettingSchema: z.ZodType<AccountSetting> = z.object({
	userId: z.string(),
	logoUrl: z.string().nullable(),
	primaryColor: z.string(),
	themePreset: ThemeEnum.nullable(),
	bgPreset: BgEnum,
	showPersonalInfo: z.boolean(),
	displayName: z.string().nullable(),
	updatedAt: z.string(),
	createdAt: z.string(),
});
