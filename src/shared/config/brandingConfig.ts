export const THEME_PRESETS = ['indigo', 'teal', 'crimson', 'amber', 'slate'] as const;
export type ThemePreset = (typeof THEME_PRESETS)[number];

export const BG_PRESETS = ['white', 'softGrey', 'tinted'] as const;
export type BgPreset = (typeof BG_PRESETS)[number];
