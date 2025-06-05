/**
 * useSignUpMutation.ts
 * -----------------------------------------------------------------------------
 * Simple wrapper around POST /api/auth/register.
 * On success we don’t invalidate any query for now (no cache involved).
 */

import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

import type { SignUpRequest, SignUpResponse } from '@/shared/models/authModels'; // adjust import path if needed

export default function useSignUpMutation() {
	return useMutation<SignUpResponse, Error, SignUpRequest>({
		mutationFn: async ({ firstName, lastName, email, password, role }) => {
			const { data } = await axios.post<SignUpResponse>('/api/auth/register', {
				firstName,
				lastName,
				email,
				password,
				role,
			});
			return data;
		},
	});
}
