// ============================================================================
// TEACHER TYPES
// ============================================================================

export interface TeacherPublicProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  bio?: string;
  profilePhotoUrl?: string;
  introVideoUrl?: string;
  hourlyRate: number;
  isApproved: boolean;
  branch: {
    id: string;
    name: string;
  };
  subjects?: Array<{ id: string; name: string }>;
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
  isBooked?: boolean;
}
