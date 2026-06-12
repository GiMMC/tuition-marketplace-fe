import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { setUser, setLoading, user, isAuthenticated, isLoading } = useAuthStore();

  const { data, isLoading: isQueryLoading, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (isQueryLoading) {
      setLoading(true);
    } else if (data) {
      setUser(data);
    } else if (error) {
      setUser(null);
    }
  }, [data, isQueryLoading, error, setUser, setLoading]);

  return { user, isAuthenticated, isLoading };
}
