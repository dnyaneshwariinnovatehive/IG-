import api from './api'
import type { Project, FilterOptions } from '@/types'
import { MOCK_PROJECTS } from '@/data/mockData'

// Re-export so hooks can import from here without going to @/types
export type { Project }

export interface ProjectFilters extends FilterOptions {}

const projectService = {
  async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    try {
      return await api.get<Project[], Project[]>('/projects', { params: filters })
    } catch {
      let results = [...MOCK_PROJECTS]
      if (filters?.domain) {
        results = results.filter((p) => p.domain === filters.domain)
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase()
        results = results.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
        )
      }
      if (filters?.difficulty) {
        results = results.filter((p) => p.difficulty === filters.difficulty)
      }
      if (filters?.minPrice !== undefined) {
        results = results.filter((p) => p.price >= (filters.minPrice as number))
      }
      if (filters?.maxPrice !== undefined) {
        results = results.filter((p) => p.price <= (filters.maxPrice as number))
      }
      if (filters?.sort === 'price-asc') {
        results = results.sort((a, b) => a.price - b.price)
      } else if (filters?.sort === 'price-desc') {
        results = results.sort((a, b) => b.price - a.price)
      } else if (filters?.sort === 'most-viewed') {
        results = results.sort((a, b) => b.views - a.views)
      } else if (filters?.sort === 'top-rated') {
        results = results.sort((a, b) => b.rating - a.rating)
      }
      return results
    }
  },

  async getProject(id: string): Promise<Project> {
    try {
      return await api.get<Project, Project>(`/projects/${id}`)
    } catch {
      const found = MOCK_PROJECTS.find((p) => p.id === id)
      if (!found) throw new Error('Project not found')
      return found
    }
  },

  async getTrendingProjects(): Promise<Project[]> {
    try {
      return await api.get<Project[], Project[]>('/projects/trending')
    } catch {
      return MOCK_PROJECTS.filter((p) => p.isTrending)
    }
  },

  async getFeaturedProjects(): Promise<Project[]> {
    try {
      return await api.get<Project[], Project[]>('/projects/featured')
    } catch {
      return MOCK_PROJECTS.filter((p) => p.isFeatured)
    }
  },

  async getTopSellingProjects(): Promise<Project[]> {
    try {
      return await api.get<Project[], Project[]>('/projects/top-selling')
    } catch {
      return MOCK_PROJECTS.filter((p) => p.isTopSelling)
    }
  },

  async getNewProjects(): Promise<Project[]> {
    try {
      return await api.get<Project[], Project[]>('/projects/new')
    } catch {
      return MOCK_PROJECTS.filter((p) => p.isNew)
    }
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    return api.post<Project, Project>('/projects', data)
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    return api.put<Project, Project>(`/projects/${id}`, data)
  },

  async deleteProject(id: string): Promise<void> {
    return api.delete<void, void>(`/projects/${id}`)
  },

  async approveProject(id: string): Promise<Project> {
    return api.post<Project, Project>(`/projects/${id}/approve`)
  },

  async rejectProject(id: string, reason: string): Promise<Project> {
    return api.post<Project, Project>(`/projects/${id}/reject`, { reason })
  },
}

export default projectService
