import { MIDDLEWARE_MATCHER_PATTERN } from '@/shared/config/routesConfig';
import { withAuth } from 'next-auth/middleware';

export default withAuth({
	pages: {
		signIn: '/auth/sign-in', // Redirect to /sign-in for all unauthenticated routes
	},
});

export const config = {
	matcher: [MIDDLEWARE_MATCHER_PATTERN],
};
