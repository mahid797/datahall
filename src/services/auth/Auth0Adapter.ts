import { randomUUID } from 'crypto';
import prisma from '../../lib/prisma';

import type {
	ChangePasswordRequest,
	ChangePasswordResponse,
	ForgotPasswordRequest,
	ForgotPasswordResponse,
	SignUpRequest,
	SignUpResponse,
} from '@/shared/models';
import { mapAuth0Error } from './helpers';
import type { IAuth } from './IAuth';
import { getMgmtToken } from './auth0MgmtToken';
import { Debug } from '@prisma/client/runtime/library';

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
				user_id: randomUUID().replace(/-/g, ''),
				email,
				auth_provider: 'AUTH0',
				auth0_sub: data.user_id,
				first_name: firstName,
				last_name: lastName,
				password: null,
				status: 'UNVERIFIED',
				role: 'ADMIN',
			},
		});

		return {
			success: true,
			message: 'User registered via Auth0',
			userId: user.user_id,
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
		const data = await res.json();

		return res.ok
			? { success: true, message: 'Reset e‑mail sent via Auth0' }
			: { success: false, message: mapAuth0Error(data) };
	}

	async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
		const { email, oldPassword, newPassword } = request;

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
				scope: 'openid',
			}),
		});
		const reauthData = await reauth.json();
		if (!reauth.ok) {
			return { success: false, message: mapAuth0Error(reauthData) };
		}

		// 2) Locate local row to get auth0_sub
		const local = await prisma.user.findUnique({ where: { email } });
		if (!local?.auth0_sub) {
			return { success: false, message: 'Local user missing auth0_sub' };
		}

		// 3) Patch password in Auth0
		const mgmtToken = await getMgmtToken();
		const patch = await fetch(`${issuer}/api/v2/users/${local.auth0_sub}`, {
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
}
