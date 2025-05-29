import SignIn from '@/app/auth/sign-in/page';

import { Sidebar } from '@/components';

import { Box, CircularProgress } from '@mui/material';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { isPublicRoute } from '@/shared/config/routesConfig';

export default function AuthProvider({ children }: { children: ReactNode }) {
	const { data: session, status } = useSession();
	const pathname = usePathname(); // Get the current route path
	const [isLoading, setIsLoading] = useState(true);

	// // Define the public routes
	// const publicRoutes = [
	// 	'/auth/sign-up',
	// 	'/auth/forgot-password',
	// 	'/auth/reset-password',
	// 	'/auth/account-created',
	// 	'/auth/password-reset-confirm',
	// 	'/auth/check-email',
	// 	'/auth/sign-in',
	// ];

	// // Check if the current path starts with /auth/reset-password, which is dynamic
	// const isResetPassFormRoute =
	// 	pathname.startsWith('/auth/reset-password') && pathname.includes('reset-password');

	// const isLinksUuidRoute =
	// 	pathname.startsWith('/links/') && /^[a-f0-9-]{36}$/.test(pathname.split('/links/')[1]);

	// useEffect to handle session status changes
	useEffect(() => {
		setIsLoading(status === 'loading');
	}, [status]);

	// Show a loading state while fetching the session
	if (isLoading) {
		return (
			<Box
				display='flex'
				justifyContent='center'
				alignItems='center'
				height='100vh'>
				<CircularProgress size={80} />
			</Box>
		);
	}

	/* ---------- unrestricted pages ---------- */
	if (isPublicRoute(pathname)) {
		return <>{children}</>;
	}

	/* ---------- auth‑guard ---------- */
	if (!session) {
		// Redirect the user to the sign-in page with a callback URL
		return <SignIn />;
	}

	return (
		<>
			<Box
				display='flex'
				bgcolor='background.content'
				height='100vh'
				width='100vw'>
				<Sidebar />
				<Box
					width='100%'
					py={{ sx: 4, sm: 10, md: 20 }}
					px={{ sx: 4, sm: 8, md: 30 }}>
					{children}
				</Box>
			</Box>
		</>
	);
}
