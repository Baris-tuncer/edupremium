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

export interface WalletSummary {
  teacherId: string;
  teacherName: string;
  pendingBalance: number;
  availableBalance: number;
  totalEarnings: number;
  totalPayouts: number;
}

export interface FinanceStats {
  totalRevenue: number;
  totalPlatformFees: number;
  totalTeacherEarnings: number;
  pendingPayouts: number;
  completedPayouts: number;
}
