-- =============================================
-- PENDING PACKAGE SLOTS - YEDEK SLOT TABLOSU
-- Ödeme tamamlanana kadar seçilen slotları saklar
-- =============================================

CREATE TABLE IF NOT EXISTS pending_package_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_payment_id UUID NOT NULL REFERENCES package_payments(id) ON DELETE CASCADE,
  slots JSONB NOT NULL, -- Array of { availabilityId, scheduledAt }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(package_payment_id)
);

-- RLS
ALTER TABLE pending_package_slots ENABLE ROW LEVEL SECURITY;

-- Herkes kendi slotlarını görebilir/ekleyebilir
CREATE POLICY "Users can manage own pending slots" ON pending_package_slots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM package_payments pp
      WHERE pp.id = pending_package_slots.package_payment_id
      AND pp.student_id = auth.uid()
    )
  );

-- Service role tam erişim
CREATE POLICY "Service role full access" ON pending_package_slots
  FOR ALL USING (true)
  WITH CHECK (true);
