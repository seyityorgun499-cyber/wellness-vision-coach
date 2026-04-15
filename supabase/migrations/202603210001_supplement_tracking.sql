-- Supplement intake tracking
CREATE TABLE IF NOT EXISTS supplement_intake_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_key TEXT NOT NULL,           -- e.g. 'whey', 'omega3', 'vitd-bt'
  supplement_name TEXT NOT NULL,          -- display name
  dosage TEXT,                            -- e.g. '25-30g'
  timing TEXT,                            -- e.g. 'Antrenman sonrası'
  taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_supplement_intake_user_date ON supplement_intake_logs(user_id, date DESC);
CREATE INDEX idx_supplement_intake_user_key ON supplement_intake_logs(user_id, supplement_key, date DESC);

-- Unique constraint: one check-in per supplement per day
CREATE UNIQUE INDEX idx_supplement_intake_unique ON supplement_intake_logs(user_id, supplement_key, date);

-- RLS
ALTER TABLE supplement_intake_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own supplement logs"
  ON supplement_intake_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own supplement logs"
  ON supplement_intake_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own supplement logs"
  ON supplement_intake_logs FOR DELETE
  USING (auth.uid() = user_id);
