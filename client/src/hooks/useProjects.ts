import { useQuery } from '@tanstack/react-query';
import projectService, { Project, ProjectFilters } from '@/services/projectService';

export function useProjects(filters?: ProjectFilters) {
  return useQuery<Project[]>({
    queryKey: ['projects', filters],
    queryFn: () => projectService.getProjects(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useTrendingProjects() {
  return useQuery<Project[]>({
    queryKey: ['projects', 'trending'],
    queryFn: projectService.getTrendingProjects,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeaturedProjects() {
  return useQuery<Project[]>({
    queryKey: ['projects', 'featured'],
    queryFn: projectService.getFeaturedProjects,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopSellingProjects() {
  return useQuery<Project[]>({
    queryKey: ['projects', 'top-selling'],
    queryFn: projectService.getTopSellingProjects,
    staleTime: 5 * 60 * 1000,
  });
}

export function useNewProjects() {
  return useQuery<Project[]>({
    queryKey: ['projects', 'new'],
    queryFn: projectService.getNewProjects,
    staleTime: 2 * 60 * 1000,
  });
}

export function useProject(id: string | undefined) {
  return useQuery<Project>({
    queryKey: ['project', id],
    queryFn: () => projectService.getProject(id as string),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
