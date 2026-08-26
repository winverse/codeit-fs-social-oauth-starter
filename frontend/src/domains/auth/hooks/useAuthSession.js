'use client';

import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/apis/authApi';

export const AUTH_ME_QUERY_KEY = ['auth', 'me'];

export function useAuthSession() {
  return useQuery({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: async () => {
      try {
        return await getMe();
      } catch (error) {
        if (error?.status === 401) {
          return null;
        }

        throw error;
      }
    },
    retry: false,
  });
}
