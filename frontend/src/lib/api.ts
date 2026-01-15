import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - token ekle
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor - hata yönetimi
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

  // ==================== AUTH ====================
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(data: any) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/auth/me');
    return response.data.data || response.data;
  }

  // ==================== ADMIN ====================
  async getAdminDashboard() {
    const response = await this.client.get('/admin/dashboard');
    return response.data.data || response.data;
  }

  async getAllTeachers() {
    const response = await this.client.get('/admin/teachers');
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : data?.data || [];
  }

  async getPendingTeachers() {
    const response = await this.client.get('/admin/teachers/pending');
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : data?.data || [];
  }

  async approveTeacher(teacherId: string) {
    const response = await this.client.put(`/admin/teachers/${teacherId}/approve`);
    return response.data;
  }

  async rejectTeacher(teacherId: string, reason?: string) {
    const response = await this.client.put(`/admin/teachers/${teacherId}/reject`, { reason });
    return response.data;
  }

  async getAllStudents() {
    const response = await this.client.get('/admin/students');
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : data?.data || [];
  }

  async getAllAppointments() {
    const response = await this.client.get('/admin/appointments');
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : data?.data || [];
  }

  async getAllPayments() {
    const response = await this.client.get('/admin/payments');
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : data?.data || [];
  }

  // ==================== TEACHER ====================
  async getTeacherDashboard() {
    const response = await this.client.get('/teachers/me/dashboard');
    return response.data.data || response.data;
  }

  async getTeacherLessons() {
    const response = await this.client.get('/teachers/me/lessons');
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : data?.data || [];
  }

  async updateTeacherProfile(data: any) {
    const response = await this.client.put('/teachers/me/profile', data);
    return response.data;
  }

  async updateTeacherAvailability(availability: any) {
    const response = await this.client.put('/teachers/me/availability', { availability });
    return response.data;
  }

  async approveAppointment(appointmentId: string) {
    const response = await this.client.put(`/teachers/me/appointments/${appointmentId}/approve`);
    return response.data;
  }

  async rejectAppointment(appointmentId: string) {
    const response = await this.client.put(`/teachers/me/appointments/${appointmentId}/reject`);
    return response.data;
  }

  async uploadTeacherPhoto(file: File) {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await this.client.post('/teachers/me/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async uploadTeacherVideo(file: File) {
    const formData = new FormData();
    formData.append('video', file);
    const response = await this.client.post('/teachers/me/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  // ==================== COMMON ====================
  async getBranches() {
    const response = await this.client.get('/branches');
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : data?.data || [];
  }

  async getSubjects() {
    const response = await this.client.get('/subjects');
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : data?.data || [];
  }
}

export const api = new ApiClient();
