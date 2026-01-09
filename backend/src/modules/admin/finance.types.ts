// ============================================================================
// FINANCE TYPES
// ============================================================================

export interface PayoutResult {
  success: boolean;
  teacherId: string;
  teacherName: string;
  amount: number;
  iban: string;
  transactionId?: string;
  message: string;
  processedAt: Date;
}

export interface PayoutSummary {
  totalTeachers: number;
  totalAmount: number;
  successCount: number;
  failedCount: number;
  results: PayoutResult[];
}
