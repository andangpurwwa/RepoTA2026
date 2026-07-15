ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_path TEXT;

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

CREATE INDEX IF NOT EXISTS idx_repository_verification_logs_repository
  ON repository_verification_logs(repository_id, created_at DESC);
