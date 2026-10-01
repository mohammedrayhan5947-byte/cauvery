-- ============================================================
-- Cauvery Resorts — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enquiries / Bookings table
CREATE TABLE IF NOT EXISTS enquiries (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  -- Guest details
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT,

  -- Stay details
  checkin     DATE NOT NULL,
  checkout    DATE NOT NULL,
  guests      INT  NOT NULL CHECK (guests > 0),
  room_type   TEXT,
  message     TEXT,

  -- Source tracking
  source_page TEXT DEFAULT 'enquiry.html',

  -- Status workflow
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  admin_notes TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enquiries_updated_at
  BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Public: can INSERT only (guest submits form)
CREATE POLICY "Public can insert enquiries"
  ON enquiries FOR INSERT
  TO anon
  WITH CHECK (true);

-- Service role (backend): full access — no policy needed, service key bypasses RLS

-- Index for common admin queries
CREATE INDEX idx_enquiries_status     ON enquiries(status);
CREATE INDEX idx_enquiries_checkin    ON enquiries(checkin);
CREATE INDEX idx_enquiries_created_at ON enquiries(created_at DESC);
