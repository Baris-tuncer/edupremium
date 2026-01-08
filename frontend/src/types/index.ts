// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

// ============================================
// USER TYPES
// ============================================
export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
}

export interface Teacher {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  bio?: string;
  profilePhotoUrl?: string;
  introVideoUrl: string;
  hourlyRate: number;
  isApproved: boolean;
  approvedAt?: string;
  iban?: string;
  branchId: string;
  branch: Branch;
  subjects: TeacherSubject[];
  completedLessons: number;
  averageRating?: number;
  createdAt: string;
}

export interface Student {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  gradeLevel?: number;
  schoolName?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  createdAt: string;
}

// ============================================
// BRANCH & SUBJECT
// ============================================
export interface Branch {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Subject {
  id: string;
  branchId: string;
  name: string;
  gradeLevel?: number;
  description?: string;
}

export interface TeacherSubject {
  id: string;
  teacherId: string;
  subjectId: string;
  subject: Subject;
}

// ============================================
// APPOINTMENT
// ============================================
export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
export type AppointmentStatus = 
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'EXPIRED';

export interface Appointment {
  id: string;
  orderCode: string;
  teacherId: string;
  teacher: Teacher;
  studentId: string;
  student: Student;
  subjectId: string;
  subject: Subject;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  platformFee: number;
  teacherEarning: number;
  teamsJoinUrl?: string;
  teamsMeetingId?: string;
  studentNotes?: string;
  cancellationReason?: string;
  bankTransferDeadline?: string;
  createdAt: string;
}

// ============================================
// FEEDBACK & REPORT
// ============================================
export type HomeworkStatus = 'NOT_ASSIGNED' | 'NOT_DONE' | 'PARTIALLY_DONE' | 'FULLY_DONE';

export interface Feedback {
  id: string;
  appointmentId: string;
  teacherId: string;
  studentId: string;
  comprehensionLevel: number;
  engagementLevel: number;
  participationLevel: number;
  homeworkStatus: HomeworkStatus;
  topicsCovered: string[];
  areasForImprovement: string[];
  teacherNotes?: string;
  aiGeneratedReport?: string;
  aiReportGeneratedAt?: string;
  createdAt: string;
}

// ============================================
// WALLET & TRANSACTIONS
// ============================================
export type TransactionType = 'EARNING' | 'WITHDRAWAL' | 'REFUND' | 'ADJUSTMENT';

export interface Wallet {
  id: string;
  teacherId: string;
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  appointmentId?: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description?: string;
  createdAt: string;
}

// ============================================
// INVITATION CODE
// ============================================
export type InvitationStatus = 'ACTIVE' | 'USED' | 'EXPIRED' | 'REVOKED';

export interface InvitationCode {
  id: string;
  code: string;
  status: InvitationStatus;
  assignedEmail?: string;
  expiresAt?: string;
  usedAt?: string;
  createdAt: string;
}

// ============================================
// AVAILABILITY
// ============================================
export interface TeacherAvailability {
  id: string;
  teacherId: string;
  dayOfWeek: number; // 0 = Monday, 6 = Sunday
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  specificDate?: string;
}

// ============================================
// NOTIFICATIONS
// ============================================
export type NotificationType = 
  | 'APPOINTMENT_CREATED'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_REMINDER'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_FAILED'
  | 'FEEDBACK_REQUEST'
  | 'REPORT_READY'
  | 'PAYOUT_PROCESSED'
  | 'TEACHER_APPROVED'
  | 'TEACHER_REJECTED';

export type NotificationStatus = 'UNREAD' | 'READ' | 'ARCHIVED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  data?: Record<string, any>;
  createdAt: string;
  readAt?: string;
}

// ============================================
// API RESPONSES
// ============================================
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// ============================================
// AUTH
// ============================================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterStudentRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  gradeLevel?: number;
  schoolName?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
}

export interface RegisterTeacherRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  invitationCode: string;
  branchId: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

// ============================================
// BOOKING
// ============================================
export interface CreateAppointmentRequest {
  teacherId: string;
  subjectId: string;
  scheduledAt: string;
  durationMinutes: number;
  paymentMethod: PaymentMethod;
  studentNotes?: string;
}

export interface TeacherListQuery {
  page?: number;
  limit?: number;
  branchId?: string;
  subjectId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

// ============================================
// DASHBOARD STATS
// ============================================
export interface StudentDashboard {
  profile: {
    firstName: string;
    lastName: string;
    gradeLevel?: number;
    schoolName?: string;
  };
  upcomingLessons: Appointment[];
  recentLessons: Appointment[];
  monthlyStats: {
    completedLessons: number;
    totalSpent: number;
  };
}

export interface TeacherDashboard {
  profile: {
    firstName: string;
    lastName: string;
    isApproved: boolean;
    hourlyRate: number;
  };
  wallet: Wallet | null;
  upcomingLessons: Appointment[];
  monthlyStats: {
    completedLessons: number;
    earnings: number;
  };
  recentFeedback: Feedback[];
}

export interface AdminDashboard {
  users: {
    totalStudents: number;
    totalTeachers: number;
    pendingTeachers: number;
  };
  appointments: {
    monthlyTotal: number;
    weeklyTotal: number;
  };
  finance: {
    monthlyRevenue: number;
    pendingBankTransfers: number;
  };
}
