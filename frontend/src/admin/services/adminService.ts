import api from '@services/api';

export interface AdminStats {
  totalProjects: number;
  totalUsers: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeUsers?: number;
  newProjectsThisMonth?: number;
  [key: string]: unknown;
}

export interface AnalyticsData {
  labels: string[];
  revenue: number[];
  users: number[];
  projects: number[];
  [key: string]: unknown;
}

const adminService = {
  async getStats(): Promise<AdminStats> {
    return api.get<AdminStats, AdminStats>('/admin/stats');
  },

  async getAnalytics(): Promise<AnalyticsData> {
    return api.get<AnalyticsData, AnalyticsData>('/admin/analytics');
  },
};

export default adminService;
