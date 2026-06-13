import api from './api';

const TOKEN_KEY = 'ig_token';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

const authService = {
  async login(email: string, password: string): Promise<User> {
    const response = await api.post<LoginResponse, LoginResponse>(
      '/auth/login',
      { email, password }
    );
    localStorage.setItem(TOKEN_KEY, response.token);
    return response.user;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  async getMe(): Promise<User> {
    const response = await api.get<LoginResponse, LoginResponse>('/auth/me');
    return response.user;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
};

export default authService;
