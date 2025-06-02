/**
 * useUpdatePassword.ts
 * ---------------------------------------------------------------------------
 * TanStack-Query mutation to PATCH /api/profile/password.
 * No cache invalidation required – endpoint doesn’t affect profile data.
 * ---------------------------------------------------------------------------
 */

import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { UpdatePasswordRequest, UpdatePasswordResponse } from '@/shared/models';

/* -------------------------------------------------------------------------- */
/*  Hook                                                                      */
/* -------------------------------------------------------------------------- */
export default function useUpdatePassword() {
	return useMutation<UpdatePasswordResponse, Error, UpdatePasswordRequest>({
		mutationFn: async ({ currentPassword, newPassword }) => {
			const { data } = await axios.patch<UpdatePasswordResponse>('/api/profile/password', {
				currentPassword,
				newPassword,
			});
			return data;
		},
	});
}
