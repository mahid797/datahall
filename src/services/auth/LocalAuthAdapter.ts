import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

import { emailService } from '@/services';

import { AuthProvider, UserRole, UserStatus } from '@/shared/enums';
import type {
	ChangeNameRequest,
	ChangeNameResponse,
	ChangePasswordRequest,
	ChangePasswordResponse,
	ForgotPasswordRequest,
	ForgotPasswordResponse,
	ResetPasswordRequest,
	ResetPasswordResponse,
	SignUpRequest,
	SignUpResponse,
	VerifyUserRequest,
	VerifyUserResponse,
} from '@/shared/models';

import type { IAuth } from './IAuth';

export class LocalAuthAdapter implements IAuth {
	async signUp(request: SignUpRequest): Promise<SignUpResponse> {
		const { email, password, firstName, lastName } = request;

		const exists = await prisma.user.findUnique({ where: { email } });
		if (exists) return { success: false, message: 'Email already exists' };

		const hashed = await bcrypt.hash(password, 10);
		const verificationToken = randomUUID();

		const user = await prisma.user.create({
			data: {
				userId: randomUUID().replace(/-/g, ''),
				email,
				password: hashed,
				firstName: firstName,
				lastName: lastName,
				authProvider: AuthProvider.Credentials,
				status: UserStatus.Unverified,
				role: UserRole.Admin, // Default to Admin; adjust as needed
				verificationToken: verificationToken,
				tokenExpiresAt: new Date(Date.now() + 86_400_000), // 24h
			},
		});

		await emailService.sendVerificationEmail(user.email, verificationToken, firstName);

		return {
			success: true,
			message: 'User registered; verification e‑mail sent.',
			userId: user.userId,
		};
	}

	async forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
		const { email } = request;
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) return { success: false, message: 'Email not registered' };

		const resetToken = randomUUID();
		await prisma.passwordResetToken.create({
			data: {
				token: resetToken,
				user: { connect: { userId: user.userId } },
			},
		});

		await emailService.sendResetPasswordEmail(email, resetToken);

		// Remove resetToken in production
		return {
			success: true,
			message: 'Reset token generated',
			resetToken,
		};
	}

	async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
		const { token, newPassword } = request;
		const fourHoursAgo = new Date(Date.now() - 14_400_000);

		const rec = await prisma.passwordResetToken.findFirst({
			where: {
				token,
				resetAt: null,
				createdAt: { gte: fourHoursAgo },
			},
		});
		if (!rec) return { success: false, message: 'Token invalid or expired' };

		const hashed = await bcrypt.hash(newPassword, 10);

		await prisma.$transaction([
			prisma.user.update({
				where: { userId: rec.userId },
				data: { password: hashed },
			}),
			prisma.passwordResetToken.update({
				where: { id: rec.id },
				data: { resetAt: new Date() },
			}),
		]);

		return { success: true, message: 'Password reset successful' };
	}

	async changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse> {
		const { email, currentPassword: oldPassword, newPassword } = request;
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user?.password) {
			return { success: false, message: 'User not found locally' };
		}

		const valid = await bcrypt.compare(oldPassword, user.password);
		if (!valid) return { success: false, message: 'Old password incorrect' };

		const hashed = await bcrypt.hash(newPassword, 10);
		await prisma.user.update({
			where: { email },
			data: { password: hashed },
		});

		return { success: true, message: 'Password changed locally' };
	}

	/* ---------- local‑only utilities ---------- */

	async verifyUser(request: VerifyUserRequest): Promise<VerifyUserResponse> {
		const { token } = request;

		// verify via token
		if (!token) {
			return { success: false, message: 'Token required', statusCode: 400 };
		}

		const user = await prisma.user.findFirst({ where: { verificationToken: token } });
		if (!user) {
			return { success: false, message: 'Invalid token', statusCode: 400 };
		}

		if (user.status === UserStatus.Active) {
			return { success: true, message: 'Already verified', statusCode: 200 };
		}

		if (user.tokenExpiresAt && user.tokenExpiresAt < new Date()) {
			return { success: false, message: 'Token expired', statusCode: 400 };
		}

		await prisma.user.update({
			where: { userId: user.userId },
			data: {
				status: UserStatus.Active,
				verificationToken: null,
				tokenExpiresAt: null,
			},
		});

		return { success: true, message: 'Email verified', statusCode: 200 };
	}
	async changeName(request: ChangeNameRequest): Promise<ChangeNameResponse> {
		const { userId, payload } = request;
		const { firstName, lastName } = payload;
		if (!firstName && !lastName) return { success: false, message: 'Nothing to update' };

		await prisma.user.update({
			where: { userId },
			data: {
				...(firstName && { firstName: firstName }),
				...(lastName && { lastName }),
			},
		});

		return { success: true, message: 'Name updated locally' };
	}
}
