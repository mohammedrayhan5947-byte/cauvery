const { sql } = require('@vercel/postgres');

// Creates the enquiries table if it doesn't exist
async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS enquiries (
      id          BIGSERIAL PRIMARY KEY,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      name        TEXT NOT NULL,
      phone       TEXT NOT NULL,
      email       TEXT,
      checkin     DATE NOT NULL,
      checkout    DATE NOT NULL,
      guests      INT  NOT NULL,
      room_type   TEXT,
      message     TEXT,
      source_page TEXT DEFAULT 'enquiry.html',
      status      TEXT NOT NULL DEFAULT 'pending',
      admin_notes TEXT,
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `;
}

module.exports = { sql, initDB };
