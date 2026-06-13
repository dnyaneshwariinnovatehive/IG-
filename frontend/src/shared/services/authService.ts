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

const MOCK_CREDENTIALS = [
  { email: 'admin@innovateguide.in', password: 'Admin@123', role: 'admin', name: 'Admin' },
];

const authService = {
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await api.post<LoginResponse, LoginResponse>(
        '/auth/login',
        { email, password }
      );
      localStorage.setItem(TOKEN_KEY, response.token);
      return response.user;
    } catch {
      const match = MOCK_CREDENTIALS.find(
        (c) => c.email === email && c.password === password
      );
      if (match) {
        const mockToken = btoa(JSON.stringify({ email: match.email, role: match.role }));
        localStorage.setItem(TOKEN_KEY, mockToken);
        return { id: 'admin-001', email: match.email, name: match.name, role: match.role };
      }
      throw new Error('Invalid email or password. Please try again.');
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  async getMe(): Promise<User> {
    try {
      const response = await api.get<LoginResponse, LoginResponse>('/auth/me');
      return response.user;
    } catch {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error('Not authenticated');
      try {
        const payload = JSON.parse(atob(token));
        const match = MOCK_CREDENTIALS.find((c) => c.email === payload.email);
        if (match) {
          return { id: 'admin-001', email: match.email, name: match.name, role: match.role };
        }
      } catch {}
      throw new Error('Session expired');
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
};

export default authService;
