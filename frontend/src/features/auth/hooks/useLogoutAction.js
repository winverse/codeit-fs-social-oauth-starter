'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { logout } from '@/apis/authApi';
import { AUTH_ME_QUERY_KEY } from './useAuthSession';

export function useLogoutAction(options = {}) {
  const { onSuccess } = options;
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      queryClient.setQueryData(AUTH_ME_QUERY_KEY, null);
      await queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
      onSuccess?.();
      router.refresh();
    },
  });
}
