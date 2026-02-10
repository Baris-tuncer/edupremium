-- ExpenseReceiptStatus enum oluştur
CREATE TYPE "ExpenseReceiptStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'PAID', 'REJECTED');

-- Teacher tablosuna yeni kolonlar ekle
ALTER TABLE "Teacher" ADD COLUMN IF NOT EXISTS "tcNumber" TEXT;
ALTER TABLE "Teacher" ADD COLUMN IF NOT EXISTS "address" TEXT;

-- ExpenseReceipt tablosu oluştur
CREATE TABLE "ExpenseReceipt" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "tcNumber" TEXT,
    "address" TEXT,
    "iban" TEXT,
    "grossAmount" DECIMAL(10,2) NOT NULL,
    "stopajRate" DECIMAL(5,2) NOT NULL DEFAULT 20,
    "stopajAmount" DECIMAL(10,2) NOT NULL,
    "netAmount" DECIMAL(10,2) NOT NULL,
    "status" "ExpenseReceiptStatus" NOT NULL DEFAULT 'DRAFT',
    "adminNotes" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "ExpenseReceipt_pkey" PRIMARY KEY ("id")
);

-- Unique constraint'ler
CREATE UNIQUE INDEX "ExpenseReceipt_appointmentId_key" ON "ExpenseReceipt"("appointmentId");
CREATE UNIQUE INDEX "ExpenseReceipt_receiptNumber_key" ON "ExpenseReceipt"("receiptNumber");

-- Foreign key'ler
ALTER TABLE "ExpenseReceipt" ADD CONSTRAINT "ExpenseReceipt_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExpenseReceipt" ADD CONSTRAINT "ExpenseReceipt_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
