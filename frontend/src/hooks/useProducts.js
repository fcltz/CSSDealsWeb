import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useProducts({ page, limit, category, search, sort }) {
  return useQuery({
    queryKey: ['products', { page, limit, category, search, sort }],
    queryFn: async () => {
      const { data } = await api.get('/products', {
        params: { page, limit, category, search, sort }
      });
      return data;
    },
    keepPreviousData: true,
  });
}
