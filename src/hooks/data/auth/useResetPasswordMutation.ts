/**
 * useResetPasswordMutation.ts
 * ---------------------------------------------------------------------------
 * POST /api/auth/password/reset
 */
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import type { ResetPasswordRequest, ResetPasswordResponse } from '@/shared/models/authModels';

export default function useResetPasswordMutation() {
	return useMutation<ResetPasswordResponse, Error, ResetPasswordRequest>({
		mutationFn: async ({ token, newPassword }) => {
			const { data } = await axios.post<ResetPasswordResponse>('/api/auth/password/reset', {
				token,
				newPassword,
			});
			return data;
		},
	});
}
