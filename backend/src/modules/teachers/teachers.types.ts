export interface TeacherPublicProfile { id: string; userId: string; firstName: string; lastName: string; bio?: string; hourlyRate: any; branch: { id: string; name: string }; }
export interface AvailabilitySlot { id: string; dayOfWeek?: number; startTime: string; endTime: string; isRecurring: boolean; }
