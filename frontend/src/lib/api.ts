import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async login(email: string, password: string) {
    const r = await this.client.post('/auth/login', { email, password });
    return r.data;
  }

  async logout() {
    const r = await this.client.post('/auth/logout');
    return r.data;
  }

  async getMe() {
    const r = await this.client.get('/auth/me');
    return r.data.data || r.data;
  }

  async getCurrentUser() {
    return this.getMe();
  }

  async getAdminDashboard() {
    const r = await this.client.get('/admin/dashboard');
    return r.data.data || r.data;
  }

  async getAllTeachers() {
    const r = await this.client.get('/admin/teachers');
    return r.data.data || r.data;
  }

  async getPendingTeachers() {
    const r = await this.client.get('/admin/teachers/pending');
    return r.data.data || r.data;
  }

  async approveTeacher(teacherId: string) {
    const r = await this.client.put(`/admin/teachers/${teacherId}/approve`);
    return r.data;
  }

  async rejectTeacher(teacherId: string) {
    const r = await this.client.put(`/admin/teachers/${teacherId}/reject`);
    return r.data;
  }

  async listBranches() {
    const r = await this.client.get('/branches');
    return r.data.data || r.data;
  }

  async listSubjects(branchId?: string) {
    const url = branchId ? `/subjects?branchId=${branchId}` : '/subjects';
    const r = await this.client.get(url);
    return r.data.data || r.data;
  }
}

const api = new ApiClient();
export default api;
