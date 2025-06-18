import { faker } from '@faker-js/faker';
import type { Prisma } from '@prisma/client';

export function makeVisitors(
	links: readonly Prisma.DocumentLinkCreateManyInput[],
	perLink = 5,
): Prisma.DocumentLinkVisitorCreateManyInput[] {
	const contactsPool = Array.from({ length: 25 }).map(() => ({
		firstName: faker.person.firstName(),
		lastName: faker.person.lastName(),
		email: faker.internet.email().toLowerCase(),
	}));

	return links.flatMap((l) =>
		Array.from({ length: perLink }).map<Prisma.DocumentLinkVisitorCreateManyInput>(() => {
			const useExisting = faker.datatype.boolean(0.6);
			let contact = useExisting
				? faker.helpers.arrayElement(contactsPool)
				: {
						firstName: faker.person.firstName(),
						lastName: faker.person.lastName(),
						email: faker.internet.email().toLowerCase(),
					};
			if (!useExisting) contactsPool.push(contact);
			const visitedEndRaw = faker.date.soon({ days: 2, refDate: l.createdAt as Date });
			const visitedEnd = visitedEndRaw > new Date() ? new Date() : visitedEndRaw;

			return {
				documentLinkId: l.documentLinkId as string,
				firstName: contact.firstName,
				lastName: contact.lastName,
				email: contact.email,
				visitorMetaData: { ip: faker.internet.ip() },
				visitedAt: faker.date.between({
					from: l.createdAt as Date,
					to: visitedEnd,
				}),
			};
		}),
	);
}
