// prisma/data/users.ts
import { UserRole, Status, Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

/**
 * Builds an array of UserCreateManyInput records.
 *
 * @param fakerCount  how many additional random users to generate
 */
export async function makeUsers(fakerCount = 0): Promise<Prisma.UserCreateManyInput[]> {
	/* ---------- shared / computed fields ---------- */
	const defaultPassword = process.env.DEFAULT_PASSWORD ?? 'test';
	const passwordHash = await bcrypt.hash(defaultPassword, 10);
	const now = new Date();

	/* ---------- 1) hard-coded admin users ---------- */
	const staticAdmins: Prisma.UserCreateManyInput[] = [
		{
			userId: '1',
			firstName: 'mahid',
			lastName: 'ahmad',
			email: 'mahid@gmail.com',
			password: passwordHash,
			role: UserRole.ADMIN,
			status: Status.ACTIVE,
			authProvider: 'CREDENTIALS',
			createdAt: now,
			updatedAt: now,
		},
		{
			userId: '2',
			firstName: 'sepideh',
			lastName: 'shahbazi',
			email: 'sepideh.shahbazi@gmail.com',
			password: passwordHash,
			role: UserRole.ADMIN,
			status: Status.ACTIVE,
			authProvider: 'CREDENTIALS',
			createdAt: now,
			updatedAt: now,
		},
		// {
		// 	userId: '3',
		// 	firstName: 'parwat',
		// 	lastName: 'kunwar',
		// 	email: 'parwatkunwar1@gmail.com',
		// 	password: passwordHash,
		// 	role: UserRole.ADMIN,
		// 	status: Status.ACTIVE,
		// 	authProvider: 'CREDENTIALS',
		// 	createdAt: now,
		// 	updatedAt: now,
		// },
		// {
		// 	userId: '4',
		// 	firstName: 'sajan',
		// 	lastName: 'ghuman',
		// 	email: 'sajanghuman18@gmail.com',
		// 	password: passwordHash,
		// 	role: UserRole.ADMIN,
		// 	status: Status.ACTIVE,
		// 	authProvider: 'CREDENTIALS',
		// 	createdAt: now,
		// 	updatedAt: now,
		// },
	];

	/* ---------- 2) faker-driven demo users ---------- */
	const fakeUsers: Prisma.UserCreateManyInput[] = Array.from({ length: fakerCount }, () => ({
		userId: randomUUID(),
		firstName: faker.person.firstName(),
		lastName: faker.person.lastName(),
		email: faker.internet.email().toLowerCase(),
		password: passwordHash, // everyone uses DEFAULT_PASSWORD
		role: UserRole.USER,
		status: Status.ACTIVE,
		authProvider: 'CREDENTIALS',
		createdAt: now,
		updatedAt: now,
	}));

	return [...staticAdmins, ...fakeUsers];
}
