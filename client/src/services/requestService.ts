import api from './api';

export interface CustomRequest {
  id?: string;
  title: string;
  description: string;
  budget?: number;
  deadline?: string;
  category?: string;
  status?: 'pending' | 'in_review' | 'accepted' | 'rejected';
  createdAt?: string;
  [key: string]: unknown;
}

const requestService = {
  async createCustomRequest(data: Partial<CustomRequest>): Promise<CustomRequest> {
    return api.post<CustomRequest, CustomRequest>('/requests/custom', data);
  },

  async getCustomRequests(): Promise<CustomRequest[]> {
    return api.get<CustomRequest[], CustomRequest[]>('/requests/custom');
  },
};

export default requestService;
