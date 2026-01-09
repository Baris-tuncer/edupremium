export interface TeacherPublicProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  bio?: string;
  introVideoUrl?: string;
  profilePhotoUrl?: string;
  hourlyRate: number;
  isApproved: boolean;
  branch: {
    id: string;
    name: string;
  };
  rating?: number;
  totalLessons?: number;
}

export interface AvailabilitySlot {
  id: string;
  teacherId: string;
  dayOfWeek?: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  specificDate?: Date;
}

export interface TeacherSearchFilters {
  branchId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TeacherListResponse {
  data: TeacherPublicProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
