import { randomUUID } from 'crypto';
import prisma from '@/lib/prisma';

import { splitName } from '@/shared/utils';
import { AuthProvider, UserStatus, UserRole } from '@/shared/enums';

/**
 * Create or update a local User row keyed by e-mail and mark it as AUTH0.
 * Used by the Auth0 ROPG sign-in flow.
 */
export async function unifyUserByEmail(
	email: string,
	opts?: { fullName?: string; picture?: string },
) {
	const existing = await prisma.user.findUnique({ where: { email } });

	const { firstName, lastName } = splitName(opts?.fullName ?? '');

	if (!existing) {
		return prisma.user.create({
			data: {
				userId: randomUUID().replace(/-/g, ''),
				email,
				authProvider: AuthProvider.Auth0,
				firstName,
				lastName,
				status: UserStatus.Active,
				password: null,
				avatarUrl: opts?.picture ?? null,
				role: UserRole.Admin,
			},
		});
	}

	const patch: Record<string, unknown> = {};

	if (existing.authProvider !== AuthProvider.Auth0) patch.authProvider = AuthProvider.Auth0;
	if (existing.status === UserStatus.Unverified) patch.status = UserStatus.Active;
	if (!existing.firstName && firstName) patch.firstName = firstName;
	if (!existing.lastName && lastName) patch.lastName = lastName;
	if (!existing.avatarUrl && opts?.picture) patch.avatarUrl = opts.picture;

	return Object.keys(patch).length
		? prisma.user.update({ where: { email }, data: patch })
		: existing;
}

/** Helper for mapping common Auth0 API errors to HTTP‑appropriate text */
export function mapAuth0Error(err: any): string {
	switch (err?.error || err?.code) {
		case 'user_exists':
			return 'User already exists';
		case 'invalid_grant':
			return 'Invalid credentials';
		default:
			return err?.error_description || 'Auth0 API error';
	}
}
