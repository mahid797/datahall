import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/*  PATCH /documents/[documentId]                                             */
/* -------------------------------------------------------------------------- */
export const DocumentPatchSchema = z.object({
	fileName: z.string().trim().min(1, 'File name cannot be empty').max(255, 'Max 255 characters'),
});

export const DocumentDetailResponseSchema = z.object({
	document: z.object({
		documentId: z.string().uuid(),
		fileName: z.string(),
		fileType: z.string(),
		filePath: z.string(),
		size: z.number(),
		createdAt: z.string(),
		updatedAt: z.string(),
		user: z.object({ firstName: z.string(), lastName: z.string() }),
	}),
});

export type DocumentPatchPayload = z.infer<typeof DocumentPatchSchema>;
export type DocumentDetailResponse = z.infer<typeof DocumentDetailResponseSchema>;
