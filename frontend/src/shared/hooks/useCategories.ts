import { useQuery } from '@tanstack/react-query';
import categoryService, { Category } from '@services/categoryService';

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
    staleTime: 10 * 60 * 1000,
  });
}
