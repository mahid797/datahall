import { faker } from '@faker-js/faker';
import type { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function makeLinks(
	documents: readonly Prisma.DocumentCreateManyInput[],
	perDoc = 6,
): Promise<Prisma.DocumentLinkCreateManyInput[]> {
	return Promise.all(
		documents.flatMap((d) =>
			Array.from({ length: perDoc }).map(async (): Promise<Prisma.DocumentLinkCreateManyInput> => {
				const isPublic = faker.helpers.maybe(() => true, { probability: 0.9 }); // 90 % public
				const hashed = isPublic
					? null
					: await bcrypt.hash(faker.internet.password({ length: 10 }), 10);

				const phrase = faker.company.catchPhrase();
				const alias = faker.helpers.slugify(phrase).toLowerCase();
				const maxLinkDate = new Date(
					Math.min(
						(d.createdAt as Date).getTime() + 3 * 24 * 60 * 60 * 1000, // doc +3 d
						Date.now(), // …but not beyond now
					),
				);
				const linkCreated = faker.date.between({
					from: d.createdAt as Date,
					to: maxLinkDate,
				});

				return {
					documentLinkId: faker.string.uuid(),
					documentId: d.documentId as string,
					createdByUserId: d.userId as string,
					alias,
					isPublic,
					password: hashed,
					expirationTime: faker.helpers.maybe(() => faker.date.soon({ days: 7 }), {
						probability: 0.2,
					}),
					visitorFields: ['name', 'email'],
					createdAt: linkCreated,
				};
			}),
		),
	);
}
