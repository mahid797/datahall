/**
 * useProfileForm.ts
 * ---------------------------------------------------------------------------
 * Form-state helper for the **name / basic profile** section.
 * Combines:
 *   • Zod schema  – ChangeNameSchema
 *   • RHF state   – useFormWithSchema
 *   • Initial API data hydration (optional)
 * ---------------------------------------------------------------------------
 */

import { ChangeNameSchema } from '@/shared/validation/profileSchemas';
import { useFormWithSchema } from '@/hooks/forms';
import type { z } from 'zod';

/* -------------------------------------------------------------------------- */
/*  Hook                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * @param initial  – Optional API payload `{ firstName, lastName, email? }`
 *                   Passed when profile data has loaded to prime defaults.
 */
export function useProfileForm(
	initial?: Partial<z.infer<typeof ChangeNameSchema>>,
	mode: 'onBlur' | 'onChange' | 'onSubmit' = 'onBlur',
) {
	/* Build default values by merging Zod-generated defaults with API data */
	const defaults = {
		firstName: '',
		lastName: '',
		email: '',
		...initial, // initial data from server overwrites blanks
	};

	return useFormWithSchema(ChangeNameSchema, defaults, mode);
}
