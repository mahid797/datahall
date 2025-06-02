import { randomUUID } from 'crypto';
import prisma from '../../lib/prisma';

import { AuthProvider, UserRole, UserStatus } from '@/shared/enums';
import type {
	ChangeNameRequest,
	ChangeNameResponse,
	ChangePasswordRequest,
	ChangePasswordResponse,
	ForgotPasswordRequest,
	ForgotPasswordResponse,
	SignUpRequest,
	SignUpResponse,
} from '@/shared/models';

import type { IAuth } from './IAuth';
import { getMgmtToken } from './auth0MgmtToken';
import { mapAuth0Error } from './helpers';
import { ServiceError } from '../errorService';

export class Auth0Adapter implements IAuth {
	async signUp(request: SignUpRequest): Promise<SignUpResponse> {
		const { email, password, firstName, lastName } = request;

		const already = await prisma.user.findUnique({ where: { email } });
		if (already) return { success: false, message: 'Email already exists' };

		const mgmtToken = await getMgmtToken();
		const issuer = process.env.AUTH0_ISSUER_BASE_URL!;

		const res = await fetch(`${issuer}/api/v2/users`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${mgmtToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				connection: 'Username-Password-Authentication',
				email,
				password,
				user_metadata: { firstName, lastName },
			}),
		});
		const data = await res.json();

		if (!res.ok) {
			return { success: false, message: mapAuth0Error(data) };
		}

		const user = await prisma.user.create({
			data: {
				userId: randomUUID().replace(/-/g, ''),
				email,
				authProvider: AuthProvider.Auth0,
				auth0Sub: data.userId,
				firstName,
				lastName,
				password: null,
				status: UserStatus.Unverified,
				role: UserRole.Admin,
			},
		});

		return {
			success: true,
			message: 'User registered via Auth0',
			userId: user.userId,
		};
	}

	async forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
		const { email } = request;
		const issuer = process.env.AUTH0_ISSUER_BASE_URL!;
		const body = {
			client_id: process.env.AUTH0_CLIENT_ID,
			email,
			connection: 'Username-Password-Authentication',
		};

		const res = await fetch(`${issuer}/dbconnections/change_password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});
		const responseText = await res.text();

		if (!res.ok || responseText.toLowerCase().includes('error')) {
			return { success: false, message: 'Failed to send reset email' };
		}

		return { success: true, message: 'Reset e‑mail sent via Auth0' };
	}

	async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
		const { email, currentPassword: oldPassword, newPassword } = request;

		const issuer = process.env.AUTH0_ISSUER_BASE_URL!;

		// 1) Re‑authenticate with old password
		const reauth = await fetch(`${issuer}/oauth/token`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				grant_type: 'password',
				username: email,
				password: oldPassword,
				client_id: process.env.AUTH0_CLIENT_ID,
				client_secret: process.env.AUTH0_CLIENT_SECRET,
				realm: process.env.AUTH0_DB_CONNECTION,
				scope: 'openid',
			}),
		});
		const reauthData = await reauth.json();
		if (!reauth.ok) {
			return { success: false, message: mapAuth0Error(reauthData) };
		}

		// 2) Locate local row to get auth0Sub
		const local = await prisma.user.findUnique({ where: { email } });
		if (!local?.auth0Sub) {
			return { success: false, message: 'Local user missing auth0Sub' };
		}

		// 3) Patch password in Auth0
		const mgmtToken = await getMgmtToken();
		const patch = await fetch(`${issuer}/api/v2/users/${local.auth0Sub}`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${mgmtToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				password: newPassword,
				connection: 'Username-Password-Authentication',
			}),
		});

		const patchData = await patch.json();

		if (process.env.DEBUG_LOGS === 'true') {
			console.log('patchData', patchData);
		}

		return patch.ok
			? { success: true, message: 'Password updated in Auth0' }
			: { success: false, message: mapAuth0Error(patchData) };
	}

	async changeName(request: ChangeNameRequest): Promise<ChangeNameResponse> {
		const { userId, payload } = request;
		const { firstName, lastName } = payload;

		if (!userId) throw new ServiceError('Missing userId', 400);

		if (!firstName && !lastName) return { success: false, message: 'Nothing to update' };

		const user = await prisma.user.findFirst({ where: { userId } });
		if (!user?.auth0Sub) throw new ServiceError('User missing auth0Sub', 404);

		try {
			/* ── 1) push to Auth0 ────────────────────────────────────── */
			const token = await getMgmtToken();
			const issuer = process.env.AUTH0_ISSUER_BASE_URL!;
			const res = await fetch(`${issuer}/api/v2/users/${user.auth0Sub}`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					user_metadata: {
						...(firstName && { firstName }),
						...(lastName && { lastName }),
					},
				}),
			});

			if (!res.ok) {
				const { message } = await res.json();
				return { success: false, message: `Auth0 update failed: ${message}` };
			}

			/* ── 2) update DB ───────────────────────────────────────────── */
			await prisma.user.update({
				where: { userId },
				data: {
					...(firstName && { firstName }),
					...(lastName && { lastName }),
				},
			});

			return { success: true, message: 'Name updated successfully' };
		} catch (error) {
			console.error('[Auth0Adapter.changeName]', error);
			return {
				success: false,
				message: 'Failed to update name',
			};
		}
	}
}
