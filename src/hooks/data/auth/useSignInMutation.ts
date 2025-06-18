/**
 * useSignInMutation.ts
 * -----------------------------------------------------------------------------
 * React-Query mutation that wraps NextAuth’s credentials sign-in.
 *
 * • Keeps loading/error state in RTK-DevTools.
 * • Throws on `error` so useFormSubmission can handle the toast.
 */

import { useMutation } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';

import type { SignInRequest, SignInResponse } from '@/shared/models/authModels';

export default function useSignInMutation() {
	return useMutation<SignInResponse, Error, SignInRequest>({
		mutationFn: async ({ email, password, remember }) => {
			const res = await signIn('credentials', {
				redirect: false,
				email,
				password,
				remember: String(remember),
			});

			if (!res) throw new Error('No response from auth server');
			if (res.error) throw new Error(res.error);

			return {
				success: true,
				message: 'Signed-in',
				url: res.url,
			};
		},
	});
}
