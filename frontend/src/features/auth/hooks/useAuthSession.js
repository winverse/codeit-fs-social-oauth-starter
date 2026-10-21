'use client';

import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/apis/authApi';

export const AUTH_ME_QUERY_KEY = ['auth', 'me'];

export function useAuthSession() {
  return useQuery({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: getMe,
    retry: false,
  });
}
