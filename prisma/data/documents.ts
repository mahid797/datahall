import { faker } from '@faker-js/faker';
import type { Prisma } from '@prisma/client';
import { buildAndUploadMedia } from './media';

const MIME_MAP = [
	{ ext: 'pdf', mime: 'application/pdf' },
	{ ext: 'png', mime: 'image/png' },
	{ ext: 'jpeg', mime: 'image/jpeg' },
	// { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
	// {
	// 	ext: 'pptx',
	// 	mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	// },
];

/**
 * Builds Document rows, uploads real media unless shouldUpload=true.
 */
export async function makeDocuments(
	users: readonly Prisma.UserCreateManyInput[],
	shouldUpload: boolean,
	perUser = 15,
): Promise<Prisma.DocumentCreateManyInput[]> {
	const tasks = users.flatMap((u) =>
		Array.from({ length: perUser }).map(async (): Promise<Prisma.DocumentCreateManyInput> => {
			const baseName = faker.commerce.productName(); // e.g. “Ergonomic Steel Pants”
			const slug = faker.helpers.slugify(baseName).toLowerCase();

			/* ---------- A · real upload path ---------- */
			if (shouldUpload) {
				const media = await buildAndUploadMedia(u.userId as string, baseName);
				return {
					documentId: faker.string.uuid(),
					userId: u.userId as string,
					fileName: media.fileName,
					filePath: media.filePath,
					fileType: media.fileType,
					size: media.size,
					createdAt: faker.date.recent({ days: 180 }),
				};
			}

			/* ---------- B · fabricated file (skip-mode) ---------- */
			const { ext, mime } = faker.helpers.arrayElement(MIME_MAP);
			return {
				documentId: faker.string.uuid(),
				userId: u.userId as string,
				fileName: `${slug}.${ext}`,
				filePath: `uploads/${slug}-${faker.string.nanoid(6)}.${ext}`,
				fileType: mime,
				size: faker.number.int({ min: 200_000, max: 2_000_000 }),
				createdAt: faker.date.recent({ days: 180 }),
			};
		}),
	);

	return Promise.all(tasks);
}
