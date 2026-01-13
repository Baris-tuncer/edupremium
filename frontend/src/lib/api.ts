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

  setAccessToken(token: string) {
    this.accessToken = token;
    if (typeof window !== 'undefined') localStorage.setItem('accessToken', token);
  }

  clearTokens() {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  private async refreshToken() {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (!refreshToken) { this.clearTokens(); window.location.href = '/login'; return; }
    try {
      const response = await this.client.post<any>('/auth/refresh', { refreshToken });
      const tokens = response.data.data || response.data;
      this.setAccessToken(tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    } catch { this.clearTokens(); window.location.href = '/login'; }
  }

  // AUTH
  async login(data: any) { const r = await this.client.post<any>('/auth/login', data); const t = r.data.data || r.data; this.setAccessToken(t.accessToken); localStorage.setItem('refreshToken', t.refreshToken); return t; }
  async registerStudent(data: any) { const r = await this.client.post<any>('/auth/register/student', data); const t = r.data.data || r.data; this.setAccessToken(t.accessToken); localStorage.setItem('refreshToken', t.refreshToken); return t; }
  async registerTeacher(data: any) { const r = await this.client.post<any>('/auth/register/teacher', data); const t = r.data.data || r.data; this.setAccessToken(t.accessToken); localStorage.setItem('refreshToken', t.refreshToken); return t; }
  async logout() { try { await this.client.post('/auth/logout'); } catch {} this.clearTokens(); }
  async forgotPassword(email: string) { await this.client.post('/auth/forgot-password', { email }); }
  async resetPassword(token: string, password: string) { await this.client.post('/auth/reset-password', { token, password }); }

  // USERS
  async getCurrentUser() { const r = await this.client.get('/users/me'); return r.data.data || r.data; }
  async changePassword(currentPassword: string, newPassword: string) { await this.client.put('/users/me/password', { currentPassword, newPassword }); }

  // TEACHERS
  async listTeachers(query: any) { const r = await this.client.get('/teachers', { params: query }); return r.data.data || r.data; }
  async getTeacher(id: string) { const r = await this.client.get(`/teachers/${id}`); return r.data.data || r.data; }
  async getTeacherAvailability(teacherId: string, startDate: string, endDate: string) { const r = await this.client.get(`/teachers/${teacherId}/availability`, { params: { startDate, endDate } }); return r.data.data || r.data; }
  async updateTeacherProfile(data: any) { const r = await this.client.put('/teachers/me/profile', data); return r.data.data || r.data; }
  async updateTeacherAvailability(slots: any[]) { await this.client.put('/teachers/me/availability', { slots }); }
  async getTeacherDashboard() { const r = await this.client.get('/teachers/me/dashboard'); return r.data.data || r.data; }
  async getMyAvailability() { const r = await this.client.get('/teachers/me/availability'); return r.data.data || r.data; }
  async getTeacherStudents() { const r = await this.client.get('/teachers/me/students'); return r.data.data || r.data; }
  async getTeacherLessons(status?: string) { const r = await this.client.get('/teachers/me/lessons', { params: { status } }); return r.data.data || r.data; }

  // STUDENTS
  async getStudentDashboard() { const r = await this.client.get('/students/me/dashboard'); return r.data.data || r.data; }
  async updateStudentProfile(data: any) { const r = await this.client.put('/students/me/profile', data); return r.data.data || r.data; }
  async getStudentLessonHistory(page = 1, limit = 20) { const r = await this.client.get('/students/me/lessons', { params: { page, limit } }); return r.data.data || r.data; }

  // APPOINTMENTS
  async createAppointment(data: any) { const r = await this.client.post('/appointments', data); return r.data.data || r.data; }
  async listAppointments(query: any) { const r = await this.client.get('/appointments', { params: query }); return r.data.data || r.data; }
  async getAppointment(id: string) { const r = await this.client.get(`/appointments/${id}`); return r.data.data || r.data; }
  async cancelAppointment(id: string, reason: string) { const r = await this.client.patch(`/appointments/${id}/cancel`, { reason }); return r.data.data || r.data; }
  async startLesson(id: string) { const r = await this.client.post(`/appointments/${id}/start`); return r.data.data || r.data; }
  async markNoShow(id: string, notes?: string) { const r = await this.client.post(`/appointments/${id}/no-show`, { notes }); return r.data.data || r.data; }

  // PAYMENTS
  async initializePayment(appointmentId: string) { const r = await this.client.post('/payments/iyzico/initialize', { appointmentId }); return r.data.data || r.data; }

  // FEEDBACK
  async submitFeedback(appointmentId: string, data: any) { const r = await this.client.post(`/feedback/${appointmentId}`, data); return r.data.data || r.data; }
  async generateAIReport(appointmentId: string) { const r = await this.client.post(`/feedback/${appointmentId}/generate-report`); return r.data.data || r.data; }

  // WALLET
  async getWalletBalance() { const r = await this.client.get('/wallet/balance'); return r.data.data || r.data; }
  async getWalletTransactions(page = 1, limit = 20) { const r = await this.client.get('/wallet/transactions', { params: { page, limit } }); return r.data.data || r.data; }

  // UPLOADS
  async uploadProfilePhoto(file: File) { const fd = new FormData(); fd.append('file', file); const r = await this.client.post('/teachers/me/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); return r.data.data || r.data; }
  async uploadIntroVideo(file: File) { const fd = new FormData(); fd.append('file', file); const r = await this.client.post('/teachers/me/video', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); return r.data.data || r.data; }

  // ADMIN
  async getAdminDashboard() { const r = await this.client.get('/admin/dashboard'); return r.data.data || r.data; }
  async getPendingTeachers(page = 1, limit = 20) { const r = await this.client.get('/admin/teachers/pending', { params: { page, limit } }); return r.data.data || r.data; }
  async approveTeacher(teacherId: string) { await this.client.post(`/admin/teachers/${teacherId}/approve`); }
  async rejectTeacher(teacherId: string, reason: string) { await this.client.post(`/admin/teachers/${teacherId}/reject`, { reason }); }
  async createInvitationCodes(data: any) { const r = await this.client.post('/admin/invitations', data); return r.data.data || r.data; }
  async listInvitations(page = 1, limit = 20, status?: string) { const r = await this.client.get('/admin/invitations', { params: { page, limit, status } }); return r.data.data || r.data; }
  async revokeInvitation(id: string) { await this.client.delete(`/admin/invitations/${id}`); }

  // BRANCHES & SUBJECTS
  async listBranches() { const r = await this.client.get('/branches'); return r.data.data || r.data; }
  async listSubjects(branchId?: string) { const r = await this.client.get('/subjects', { params: { branchId } }); return r.data.data || r.data; }
}

export const api = new ApiClient();

  // Appointment actions
  async approveAppointment(id: string) { const r = await this.client.put(`/teachers/me/appointments/${id}/approve`); return r.data; }
  async rejectAppointment(id: string, reason?: string) { const r = await this.client.put(`/teachers/me/appointments/${id}/reject`, { reason }); return r.data; }
