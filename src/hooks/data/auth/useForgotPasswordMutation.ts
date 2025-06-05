/**
 * useForgotPasswordMutation.ts
 * ---------------------------------------------------------------------------
 * Wraps POST /api/auth/password/forgot in a TanStack-Query mutation.
 * On success the API returns `{ success, message }` (message is optional).
 */
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import type { ForgotPasswordRequest, ForgotPasswordResponse } from '@/shared/models/authModels';

export default function useForgotPasswordMutation() {
	return useMutation<ForgotPasswordResponse, Error, ForgotPasswordRequest>({
		mutationFn: async ({ email }) => {
			const { data } = await axios.post<ForgotPasswordResponse>('/api/auth/password/forgot', {
				email,
			});
			return data;
		},
	});
}
