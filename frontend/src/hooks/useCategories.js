import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hora, categorias não mudam com tanta frequência
  });
}
