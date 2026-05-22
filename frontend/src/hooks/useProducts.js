import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useProducts({ page, limit, category, search, sort, minPrice, maxPrice, size }) {
  const categoryParam = Array.isArray(category) ? category.join(',') : category;
  return useQuery({
    queryKey: ['products', { page, limit, category: categoryParam, search, sort, minPrice, maxPrice, size }],
    queryFn: async () => {
      const { data } = await api.get('/products', {
        params: { page, limit, category: categoryParam, search, sort, minPrice, maxPrice, size }
      });
      return data;
    },
    keepPreviousData: true,
  });
}
