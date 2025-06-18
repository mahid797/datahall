/**
 * useUpdateNameMutation.ts
 * ---------------------------------------------------------------------------
 * TanStack-Query mutation to PATCH /api/profile/name.
 * On success we invalidate the PROFILE query so UI picks up fresh data.
 * ---------------------------------------------------------------------------
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { queryKeys } from '@/shared/queryKeys';
import { UpdateNameRequest, UpdateNameResponse } from '@/shared/models';

/* -------------------------------------------------------------------------- */
/*  Hook                                                                      */
/* -------------------------------------------------------------------------- */
export default function useUpdateNameMutation() {
	const queryClient = useQueryClient();

	return useMutation<UpdateNameResponse, Error, UpdateNameRequest>({
		mutationFn: async ({ firstName, lastName }) => {
			const { data } = await axios.patch<UpdateNameResponse>('/api/profile/name', {
				firstName,
				lastName,
			});
			return data;
		},

		/* Refresh cached profile after successful update */
		onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.profile.base }),
	});
}
