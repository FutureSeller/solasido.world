-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content_base64 TEXT NOT NULL,
  created_at TEXT NOT NULL,
  tags TEXT,
  cover_url TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tags ON posts(tags);
