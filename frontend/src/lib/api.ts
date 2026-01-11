// ============================================================================
// API SERVICE
// ============================================================================

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import type {
  ApiResponse,
  TokenResponse,
  LoginRequest,
  RegisterStudentRequest,
  RegisterTeacherRequest,
  Teacher,
  Student,
  Appointment,
  CreateAppointmentRequest,
  TeacherListQuery,
  PaginatedResponse,
  StudentDashboard,
  TeacherDashboard,
  AdminDashboard,
  Feedback,
  InvitationCode,
  WalletTransaction,
} from '@/types';

// ============================================
// API CLIENT
// ============================================
class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use((config) => {
      if (this.accessToken || (typeof window !== "undefined" && localStorage.getItem("accessToken"))) { this.accessToken = this.accessToken || localStorage.getItem("accessToken");
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Try to refresh token
          await this.refreshToken();
        }
        return Promise.reject(error);
      }
    );

    // Load token from storage on init
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
    }
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
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
    if (!refreshToken) {
      this.clearTokens();
      window.location.href = '/login';
      return;
    }

    try {
      const response = await this.client.post<TokenResponse>('/auth/refresh', { refreshToken });
      this.setAccessToken(response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    } catch {
      this.clearTokens();
      window.location.href = '/login';
    }
  }

  // ========================================
  // AUTH
  // ========================================
  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await this.client.post<TokenResponse>('/auth/login', data);
    this.setAccessToken(response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  }

  async registerStudent(data: RegisterStudentRequest): Promise<TokenResponse> {
    const response = await this.client.post<TokenResponse>('/auth/register/student', data);
    this.setAccessToken(response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  }

  async registerTeacher(data: RegisterTeacherRequest): Promise<TokenResponse> {
    const response = await this.client.post<TokenResponse>('/auth/register/teacher', data);
    this.setAccessToken(response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
    this.clearTokens();
  }

  async forgotPassword(email: string): Promise<void> {
    await this.client.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await this.client.post('/auth/reset-password', { token, password });
  }

  // ========================================
  // USERS
  // ========================================
  async getCurrentUser(): Promise<any> {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.client.put('/users/me/password', { currentPassword, newPassword });
  }

  async exportUserData(): Promise<any> {
    const response = await this.client.get('/users/me/data-export');
    return response.data;
  }

  // ========================================
  // TEACHERS
  // ========================================
  async listTeachers(query: TeacherListQuery): Promise<PaginatedResponse<Teacher>> {
    const response = await this.client.get('/teachers', { params: query });
    return response.data;
  }

  async getTeacher(id: string): Promise<Teacher> {
    const response = await this.client.get(`/teachers/${id}`);
    return response.data;
  }

  async getTeacherAvailability(teacherId: string, startDate: string, endDate: string) {
    const response = await this.client.get(`/teachers/${teacherId}/availability`, {
      params: { startDate, endDate },
    });
    return response.data;
  }

  async updateTeacherProfile(data: Partial<Teacher>): Promise<Teacher> {
    const response = await this.client.put('/teachers/me/profile', data);
    return response.data;
  }

  async updateTeacherAvailability(slots: any[]): Promise<void> {
    await this.client.put('/teachers/me/availability', { slots });
  }

  async getTeacherDashboard(): Promise<TeacherDashboard> {
    const response = await this.client.get('/teachers/me/dashboard');
    return response.data;
  }

  // ========================================
  // STUDENTS
  // ========================================
  async getStudentDashboard(): Promise<StudentDashboard> {
    const response = await this.client.get('/students/me/dashboard');
    return response.data;
  }

  async updateStudentProfile(data: Partial<Student>): Promise<Student> {
    const response = await this.client.put('/students/me/profile', data);
    return response.data;
  }

  async getStudentLessonHistory(page = 1, limit = 20): Promise<PaginatedResponse<Appointment>> {
    const response = await this.client.get('/students/me/lessons', { params: { page, limit } });
    return response.data;
  }

  async getLessonReport(appointmentId: string): Promise<Feedback> {
    const response = await this.client.get(`/students/me/lessons/${appointmentId}/report`);
    return response.data;
  }

  // ========================================
  // APPOINTMENTS
  // ========================================
  async createAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
    const response = await this.client.post('/appointments', data);
    return response.data;
  }

  async listAppointments(query: any): Promise<PaginatedResponse<Appointment>> {
    const response = await this.client.get('/appointments', { params: query });
    return response.data;
  }

  async getAppointment(id: string): Promise<Appointment> {
    const response = await this.client.get(`/appointments/${id}`);
    return response.data;
  }

  async cancelAppointment(id: string, reason: string): Promise<Appointment> {
    const response = await this.client.patch(`/appointments/${id}/cancel`, { reason });
    return response.data;
  }

  async startLesson(id: string): Promise<Appointment> {
    const response = await this.client.post(`/appointments/${id}/start`);
    return response.data;
  }

  async markNoShow(id: string, notes?: string): Promise<Appointment> {
    const response = await this.client.post(`/appointments/${id}/no-show`, { notes });
    return response.data;
  }

  // ========================================
  // PAYMENTS
  // ========================================
  async initializePayment(appointmentId: string): Promise<{ paymentPageUrl: string }> {
    const response = await this.client.post(`/payments/iyzico/initialize`, { appointmentId });
    return response.data;
  }

  async uploadBankTransferReceipt(appointmentId: string, receiptUrl: string): Promise<void> {
    await this.client.post(`/appointments/${appointmentId}/upload-receipt`, { receiptUrl });
  }

  // ========================================
  // FEEDBACK
  // ========================================
  async submitFeedback(appointmentId: string, data: any): Promise<Feedback> {
    const response = await this.client.post(`/feedback/${appointmentId}`, data);
    return response.data;
  }

  // ========================================
  // WALLET
  // ========================================
  async getWalletTransactions(page = 1, limit = 20): Promise<PaginatedResponse<WalletTransaction>> {
    const response = await this.client.get('/wallet/transactions', { params: { page, limit } });
    return response.data;
  }

  // ========================================
  // ADMIN
  // ========================================
  async getAdminDashboard(): Promise<AdminDashboard> {
    const response = await this.client.get('/admin/dashboard');
    return response.data;
  }

  async getPendingTeachers(page = 1, limit = 20): Promise<PaginatedResponse<Teacher>> {
    const response = await this.client.get('/admin/teachers/pending', { params: { page, limit } });
    return response.data;
  }

  async approveTeacher(teacherId: string): Promise<void> {
    await this.client.post(`/admin/teachers/${teacherId}/approve`);
  }

  async rejectTeacher(teacherId: string, reason: string): Promise<void> {
    await this.client.post(`/admin/teachers/${teacherId}/reject`, { reason });
  }

  async createInvitationCodes(data: { count?: number; assignedEmail?: string; expiresInDays?: number }): Promise<InvitationCode[]> {
    const response = await this.client.post('/admin/invitations', data);
    return response.data;
  }

  async listInvitations(page = 1, limit = 20, status?: string): Promise<PaginatedResponse<InvitationCode>> {
    const response = await this.client.get('/admin/invitations', { params: { page, limit, status } });
    return response.data;
  }

  async revokeInvitation(id: string): Promise<void> {
    await this.client.delete(`/admin/invitations/${id}`);
  }

  async approveBankTransfer(appointmentId: string): Promise<void> {
    await this.client.post(`/admin/payments/${appointmentId}/approve`);
  }

  async rejectBankTransfer(appointmentId: string, reason: string): Promise<void> {
    await this.client.post(`/admin/payments/${appointmentId}/reject`, { reason });
  }

  async getHakedisReport(year: number, month: number): Promise<any> {
    const response = await this.client.get('/admin/finance/hakedis', { params: { year, month } });
    return response.data;
  }

  async processPayout(walletId: string, amount: number, reference: string): Promise<void> {
    await this.client.post('/admin/finance/payout', { walletId, amount, reference });
  }

  // ========================================
  // BRANCHES & SUBJECTS
  // ========================================
  async listBranches(): Promise<any[]> {
    const response = await this.client.get('/branches');
    return response.data;
  }

  async listSubjects(branchId?: string): Promise<any[]> {
    const response = await this.client.get('/subjects', { params: { branchId } });
    return response.data;
  }
}

// Export singleton instance
export const api = new ApiClient();
