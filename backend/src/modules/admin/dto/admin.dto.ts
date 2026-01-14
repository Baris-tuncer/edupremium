export class DashboardStatsDto {
  totalTeachers: number;
  activeTeachers: number;
  pendingTeachers: number;
  totalStudents: number;
  activeStudents: number;
  totalAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export class ApproveTeacherDto {
  isApproved: boolean;
  rejectionReason?: string;
}

export class TeacherListItemDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  branch: {
    id: string;
    name: string;
  };
  subjects: Array<{
    id: string;
    name: string;
  }>;
  experience: number;
  hourlyRate: number;
  isApproved: boolean;
  rating: number;
  totalLessons: number;
  createdAt: Date;
  photoUrl?: string;
}

export class StudentListItemDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  grade?: string;
  school?: string;
  parentPhone?: string;
  totalLessons: number;
  createdAt: Date;
}

export class AppointmentListItemDto {
  id: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
  };
  scheduledAt: Date;
  duration: number;
  status: string;
  price: number;
  createdAt: Date;
}
