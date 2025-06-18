'use client';
import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import AuthProvider from '@/providers/auth/AuthProvider';
import { ModalProvider } from '@/providers/modal/ModalProvider';
import QueryProvider from '@/providers/query/QueryProvider';
import { ToastProvider } from '@/providers/toast/ToastProvider';

import globalTheme from '@/theme/globalTheme';
import { LoadingSpinner } from '@/components';

export default function Providers({ children }: { children: React.ReactNode }) {
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		setIsHydrated(true);
	}, []);

	if (!isHydrated) {
		// Show a loading spinner while the client-side is hydrating
		return <LoadingSpinner />;
	}

	return (
		<SessionProvider>
			<AppRouterCacheProvider>
				<ThemeProvider theme={globalTheme}>
					<CssBaseline />
					<ToastProvider>
						<LocalizationProvider dateAdapter={AdapterDayjs}>
							<QueryProvider>
								<ModalProvider>
									<AuthProvider>{children}</AuthProvider>
								</ModalProvider>
							</QueryProvider>
						</LocalizationProvider>
					</ToastProvider>
				</ThemeProvider>
			</AppRouterCacheProvider>
		</SessionProvider>
	);
}
