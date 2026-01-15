import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/giris';
        }
        return Promise.reject(error);
      }
    );
  }

  // AUTH
  async login(email: string, password: string) {
    const r = await this.client.post('/auth/login', { email, password });
    return r.data;
  }

  async register(data: any) {
    const r = await this.client.post('/auth/register', data);
    return r.data;
  }

  async getMe() {
    const r = await this.client.get('/auth/me');
    return r.data.data || r.data;
  }

  // ADMIN
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

  async rejectTeacher(teacherId: string, reason?: string) {
    const r = await this.client.put(`/admin/teachers/${teacherId}/reject`, { reason });
    return r.data;
  }

  async getAllStudents() {
    const r = await this.client.get('/admin/students');
    return r.data.data || r.data;
  }

  // STUDENT
  async getStudentDashboard() {
    const r = await this.client.get('/students/me/dashboard');
    return r.data.data || r.data;
  }

  // TEACHER
  async getTeacherDashboard() {
    const r = await this.client.get('/teachers/me/dashboard');
    return r.data.data || r.data;
  }

  async getTeacherLessons() {
    const r = await this.client.get('/teachers/me/lessons');
    return r.data.data || r.data;
  }

  // COMMON
  async getBranches() {
    const r = await this.client.get('/branches');
    return r.data.data || r.data;
  }

  async getSubjects() {
    const r = await this.client.get('/subjects');
    return r.data.data || r.data;
  }
}

export const api = new ApiClient();
