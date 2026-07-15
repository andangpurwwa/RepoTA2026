CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  nim VARCHAR(40) UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'mahasiswa')),
  profile_photo_url TEXT,
  profile_photo_path TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_path TEXT;

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS keywords (
  id SERIAL PRIMARY KEY,
  keyword VARCHAR(120) NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(keyword, category_id)
);

CREATE TABLE IF NOT EXISTS repositories (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  abstract TEXT,
  research_year INTEGER,
  research_date DATE,
  advisor VARCHAR(160),
  author_name VARCHAR(160),
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  file_name TEXT,
  file_path TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  rejection_note TEXT,
  submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE repositories ADD COLUMN IF NOT EXISTS nim VARCHAR(40);
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS email_uad TEXT;
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS no_hp VARCHAR(80);
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS program_studi TEXT;
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS jenis_ujian VARCHAR(40);
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS penguji TEXT;
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS hari_ujian TEXT;
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS jam_ujian TEXT;
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS link_dokumen TEXT;
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS research_date DATE;
ALTER TABLE repositories ADD COLUMN IF NOT EXISTS rejection_note TEXT;

ALTER TABLE repositories DROP CONSTRAINT IF EXISTS repositories_status_check;
ALTER TABLE repositories
  ADD CONSTRAINT repositories_status_check
  CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'revision'));

UPDATE repositories
SET research_date = make_date(research_year, 1, 1)
WHERE research_date IS NULL AND research_year IS NOT NULL;

CREATE TABLE IF NOT EXISTS password_reset_otps (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(160) NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS repository_verification_logs (
  id BIGSERIAL PRIMARY KEY,
  repository_id INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(60) NOT NULL,
  old_status VARCHAR(30),
  new_status VARCHAR(30),
  note TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_repositories_status ON repositories(status);
CREATE INDEX IF NOT EXISTS idx_repositories_year ON repositories(research_year);
CREATE INDEX IF NOT EXISTS idx_repositories_date ON repositories(research_date);
CREATE INDEX IF NOT EXISTS idx_repositories_category ON repositories(category_id);
CREATE INDEX IF NOT EXISTS idx_keywords_category ON keywords(category_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_otps(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_otps(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_active
  ON password_reset_otps(user_id, expires_at)
  WHERE used_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_repository_verification_logs_repository
  ON repository_verification_logs(repository_id, created_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_keywords_updated_at ON keywords;
CREATE TRIGGER trg_keywords_updated_at
BEFORE UPDATE ON keywords
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_repositories_updated_at ON repositories;
CREATE TRIGGER trg_repositories_updated_at
BEFORE UPDATE ON repositories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
