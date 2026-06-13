import api from './api';
import { MOCK_CATEGORIES } from '@/data/mockData';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  projectCount?: number;
}

const categoryService = {
  async getCategories(): Promise<Category[]> {
    try {
      return await api.get<Category[], Category[]>('/categories');
    } catch {
      return MOCK_CATEGORIES;
    }
  },
};

export default categoryService;
