import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/*  PATCH /documents/[documentId]                                             */
/* -------------------------------------------------------------------------- */
export const DocumentPatchSchema = z.object({
	fileName: z.string().trim().min(1, 'File name cannot be empty').max(255, 'Max 255 characters'),
});

export type DocumentPatchPayload = z.infer<typeof DocumentPatchSchema>;
