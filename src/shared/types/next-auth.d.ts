import NextAuth from 'next-auth';
import type { AuthProvider, UserStatus, UserRole } from '@/shared/enums';

declare module 'next-auth' {
	interface User {
		id: string;
		userId: string;
		role: UserRole; // 'ADMIN' | 'USER'
		firstName: string;
		lastName: string;
		email: string;
		authProvider: AuthProvider;
		avatarUrl?: string;
		status?: UserStatus;
	}

	interface Session {
		user: User;
	}
}
