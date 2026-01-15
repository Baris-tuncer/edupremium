import axios, { AxiosError, AxiosInstance } from 'axios';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://edupremium-production.up.railway.app',
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config) => {
      if (this.accessToken || (typeof window !== "undefined" && localStorage.getItem("accessToken"))) {
        this.accessToken = this.accessToken || localStorage.getItem("accessToken");
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          await this.refreshToken();
        }
        return Promise.reject(error);
      }
    );

    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
    }
  }

  private setAccessToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
  }

  private clearTokens() {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.clearTokens();
      window.location.href = '/login';
      return;
    }

    try {
      const response = await this.client.post('/auth/refresh', { refreshToken });
      const data = response.data.data || response.data;
      this.setAccessToken(data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    } catch (error) {
      this.clearTokens();
      window.location.href = '/login';
    }
  }

  // AUTH
  async login(credentials: any) {
    const response = await this.client.post('/auth/login', credentials);
    const data = response.data.data || response.data;
    this.setAccessToken(data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data;
  }

  async registerStudent(data: any) {
    const response = await this.client.post('/auth/register/student', data);
    const result = response.data.data || response.data;
    this.setAccessToken(result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    return result;
  }

  async registerTeacher(data: any) {
    const response = await this.client.post('/auth/register/teacher', data);
    const result = response.data.data || response.data;
    this.setAccessToken(result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    return result;
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      // Ignore errors
    }
    this.clearTokens();
  }

  async forgotPassword(email: string) {
    await this.client.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string) {
    await this.client.post('/auth/reset-password', { token, password });
  }

  async getCurrentUser() {
    const response = await this.client.get('/users/me');
    return response.data.data || response.data;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    await this.client.put('/users/me/password', { currentPassword, newPassword });
  }

  // TEACHERS
  async listTeachers(params?: any) {
    const response = await this.client.get('/teachers', { params });
    return response.data.data || response.data;
  }

  async getTeacher(id: string) {
    const response = await this.client.get(`/teachers/${id}`);
    return response.data.data || response.data;
  }

  async getTeacherAvailability(id: string, startDate: string, endDate: string) {
    const response = await this.client.get(`/teachers/${id}/availability`, {
      params: { startDate, endDate },
    });
    return response.data.data || response.data;
  }

  async updateTeacherProfile(data: any) {
    const response = await this.client.put('/teachers/me/profile', data);
    return response.data.data || response.data;
  }

  async updateTeacherAvailability(slots: any) {
    await this.client.put('/teachers/me/availability', { slots });
  }

  async getMe() {
    const response = await this.client.get('/auth/me');
    return response.data.data || response.data;
  }

  async getTeacherDashboard() {
    const response = await this.client.get('/teachers/me/dashboard');
    return response.data.data || response.data;
  }

  async getMyAvailability() {
    const response = await this.client.get('/teachers/me/availability');
    return response.data.data || response.data;
  }

  async getTeacherStudents() {
    const response = await this.client.get('/teachers/me/students');
    return response.data.data || response.data;
  }

  async getTeacherLessons(status?: string) {
    const response = await this.client.get('/teachers/me/lessons', { params: { status } });
    return response.data.data || response.data;
  }

  // STUDENTS
  async getStudentDashboard() {
    const response = await this.client.get('/students/me/dashboard');
    return response.data.data || response.data;
  }

  async updateStudentProfile(data: any) {
    const response = await this.client.put('/students/me/profile', data);
    return response.data.data || response.data;
  }

  async getStudentLessonHistory(page = 1, limit = 20) {
    const response = await this.client.get('/students/me/lessons', { params: { page, limit } });
    return response.data.data || response.data;
  }

  // APPOINTMENTS
  async createAppointment(data: any) {
    const response = await this.client.post('/appointments', data);
    return response.data.data || response.data;
  }

  async listAppointments(params?: any) {
    const response = await this.client.get('/appointments', { params });
    return response.data.data || response.data;
  }

  async getAppointment(id: string) {
    const response = await this.client.get(`/appointments/${id}`);
    return response.data.data || response.data;
  }

  async cancelAppointment(id: string, reason?: string) {
    const response = await this.client.patch(`/appointments/${id}/cancel`, { reason });
    return response.data.data || response.data;
  }

  async startLesson(id: string) {
    const response = await this.client.post(`/appointments/${id}/start`);
    return response.data.data || response.data;
  }

  async markNoShow(id: string, notes?: string) {
    const response = await this.client.post(`/appointments/${id}/no-show`, { notes });
    return response.data.data || response.data;
  }

  // PAYMENTS
  async initializePayment(appointmentId: string) {
    const response = await this.client.post('/payments/iyzico/initialize', { appointmentId });
    return response.data.data || response.data;
  }

  // FEEDBACK
  async submitFeedback(appointmentId: string, feedback: any) {
    const response = await this.client.post(`/feedback/${appointmentId}`, feedback);
    return response.data.data || response.data;
  }

  async generateAIReport(appointmentId: string) {
    const response = await this.client.post(`/feedback/${appointmentId}/generate-report`);
    return response.data.data || response.data;
  }

  // WALLET
  async getWalletBalance() {
    const response = await this.client.get('/wallet/balance');
    return response.data.data || response.data;
  }

  async getWalletTransactions(page = 1, limit = 20) {
    const response = await this.client.get('/wallet/transactions', { params: { page, limit } });
    return response.data.data || response.data;
  }

  // FILE UPLOADS
  async uploadProfilePhoto(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post('/teachers/me/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data || response.data;
  }

  async uploadIntroVideo(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post('/teachers/me/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data || response.data;
  }

  // ADMIN
  async getAdminDashboard() {
    const response = await this.client.get('/admin/dashboard');
    return response.data.data || response.data;
  }

  async getAllTeachers() {
    const response = await this.client.get('/admin/teachers');
    return response.data.data || response.data;
  }

  async getTeacherById(teacherId: string) {
    const response = await this.client.get(`/admin/teachers/${teacherId}`);
    return response.data.data || response.data;
  }

  async approveTeacher(teacherId: string) {
    const response = await this.client.put(
      `/admin/teachers/${teacherId}/approve`,
      { isApproved: true }
    );
    return response.data.data || response.data;
  }

  async rejectTeacher(teacherId: string, reason?: string) {
    const response = await this.client.put(
      `/admin/teachers/${teacherId}/approve`,
      { isApproved: false, rejectionReason: reason }
    );
    return response.data.data || response.data;
  }

  async getAllStudents() {
    const response = await this.client.get('/admin/students');
    return response.data.data || response.data;
  }

  async getAllAppointments() {
    const response = await this.client.get('/admin/appointments');
    return response.data.data || response.data;
  }

  async createInvitationCodes(data: any) {
    const response = await this.client.post('/admin/invitations', data);
    return response.data.data || response.data;
  }

  async listInvitations(page = 1, limit = 20, status?: string) {
    const response = await this.client.get('/admin/invitations', { params: { page, limit, status } });
    return response.data.data || response.data;
  }

  async revokeInvitation(id: string) {
    await this.client.delete(`/admin/invitations/${id}`);
  }

  // BRANCHES & SUBJECTS
  async listBranches() {
    const response = await this.client.get('/branches');
    return response.data.data || response.data;
  }

  async listSubjects(branchId?: string) {
    const response = await this.client.get('/subjects', { params: { branchId } });
    return response.data.data || response.data;
  }

  async approveAppointment(id: string) {
    const response = await this.client.put(`/teachers/me/appointments/${id}/approve`);
    return response.data;
  }

  async rejectAppointment(id: string, reason?: string) {
    const response = await this.client.put(`/teachers/me/appointments/${id}/reject`, { reason });
    return response.data;
  }
}

export const api = new ApiClient();
export default api;
