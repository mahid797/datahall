import bcryptjs from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';
import { jwtDecode } from 'jwt-decode';

import CredentialsProvider from 'next-auth/providers/credentials';

import prisma from '@/lib/prisma';
import { unifyUserByEmail } from '@/services/auth/authService';
import { AuthProvider as AuthProviderEnum, UserRole, UserStatus } from '@/shared/enums';

/* -------------------------------------------------------------------------- */
/*  Provider definitions                                                      */
/* -------------------------------------------------------------------------- */
const providers = [];

if (process.env.AUTH_METHOD?.toLowerCase() === 'credentials') {
	/* ───────────── Local Credentials ───────────── */
	providers.push(
		CredentialsProvider({
			name: 'Local Credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
				remember: { label: 'Remember', type: 'checkbox' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials.password) {
					throw new Error('Email and password are required');
				}

				// 1) Find user by email
				const user = await prisma.user.findUnique({
					where: { email: credentials.email },
				});
				if (!user) throw new Error('No user found with that e-mail');
				if (user.status !== UserStatus.Active) {
					throw new Error('Please verify your e-mail before signing in');
				}

				// 2) Check password
				const isPasswordValid = await bcryptjs.compare(credentials.password, user.password!);
				if (!isPasswordValid) {
					throw new Error('Invalid password');
				}

				// Return user fields for the JWT/session
				return {
					id: user.id.toString(),
					userId: user.userId,
					email: user.email,
					role: user.role as UserRole,
					firstName: user.firstName,
					lastName: user.lastName,
					authProvider: user.authProvider as AuthProviderEnum,
					avatarUrl: user.avatarUrl ?? undefined,
					status: user.status as UserStatus,
					remember: credentials.remember === 'true',
				};
			},
		}),
	);
} else if (process.env.AUTH_METHOD?.toLowerCase() === 'auth0') {
	/* ───────────── Auth0 – ROPG ───────────── */
	providers.push(
		CredentialsProvider({
			name: 'Auth0 ROPG',
			credentials: {
				email: { label: 'Email', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials.password) {
					throw new Error('Email and password are required');
				}

				// 1) Call Auth0's /oauth/token with grant_type=password
				const resp = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						grant_type: 'password',
						username: credentials.email,
						password: credentials.password,
						client_id: process.env.AUTH0_CLIENT_ID,
						client_secret: process.env.AUTH0_CLIENT_SECRET,
						realm: process.env.AUTH0_DB_CONNECTION,
					}),
				});
				const auth0 = await resp.json();
				if (!resp.ok || !auth0.id_token) {
					throw new Error(auth0.error_description || 'Invalid credentials');
				}

				// We could parse id_token to get user claims; for now, unify by email:
				const finalUser = await unifyUserByEmail(credentials.email, {
					// If you want to parse name from id_token, do so. For brevity, skip it here
					fullName: '',
					picture: undefined,
				});

				const claims = jwtDecode<{ email_verified?: boolean }>(auth0.id_token);
				if (!claims.email_verified) throw new Error('Please verify your e-mail');

				if (claims.email_verified && finalUser.status !== UserStatus.Active) {
					await prisma.user.update({
						where: { userId: finalUser.userId },
						data: { status: UserStatus.Active },
					});
					finalUser.status = UserStatus.Active;
				}

				return {
					id: finalUser.id.toString(),
					userId: finalUser.userId,
					email: finalUser.email,
					role: finalUser.role as UserRole,
					firstName: finalUser.firstName,
					lastName: finalUser.lastName,
					authProvider: finalUser.authProvider as AuthProviderEnum,
					avatarUrl: finalUser.avatarUrl ?? undefined,
					status: finalUser.status as UserStatus,
				};
			},
		}),
	);
}

/* -------------------------------------------------------------------------- */
/*  Next-Auth config                                                          */
/* -------------------------------------------------------------------------- */

export const authOptions: NextAuthOptions = {
	session: {
		strategy: 'jwt',
		maxAge: 24 * 60 * 60,
	},
	providers,
	pages: {
		signIn: '/auth/sign-in',
	},
	callbacks: {
		// signIn callback might not be necessary if using ROPG,
		// but kept it if we do something else (like unify social logins).
		async signIn({ user }) {
			return true;
		},
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.userId = user.userId;
				token.role = user.role as UserRole;
				token.firstName = user.firstName;
				token.lastName = user.lastName;
				token.email = user.email;
				token.authProvider = user.authProvider as AuthProviderEnum;
				token.avatarUrl = user.avatarUrl;
				token.status = user.status as UserStatus;
				token.remember30d = (user as any).remember ?? false;

				if (token.remember30d) {
					token.exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30 days
				}
			}
			return token;
		},

		async session({ session, token }) {
			session.user = {
				id: token.id as string,
				userId: token.userId as string,
				role: token.role as UserRole,
				firstName: token.firstName as string,
				lastName: token.lastName as string,
				email: token.email as string,
				authProvider: token.authProvider as AuthProviderEnum,
				avatarUrl: token.avatarUrl as string | undefined,
				status: token.status as UserStatus,
			};
			return session;
		},

		async redirect({ url, baseUrl }) {
			return url.startsWith(baseUrl) ? url : baseUrl;
		},
	},
};
