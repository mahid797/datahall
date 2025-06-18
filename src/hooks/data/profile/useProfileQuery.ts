import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { queryKeys } from '@/shared/queryKeys';
import { ProfileDto } from '@/shared/models';

/**
 * Fetch current user profile. Cached for 5 min; no auto-refetch on focus.
 */
export default function useProfileQuery() {
	return useQuery<ProfileDto, Error>({
		queryKey: queryKeys.profile.base,
		queryFn: async () => {
			const { data } = await axios.get<ProfileDto>('/api/profile');
			return data;
		},
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});
}
