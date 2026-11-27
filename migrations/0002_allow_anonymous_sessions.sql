CREATE TABLE IF NOT EXISTS admin_sessions_v2 (
  sid_hash TEXT PRIMARY KEY,
  admin_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
  csrf_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

INSERT OR IGNORE INTO admin_sessions_v2 (sid_hash, admin_id, csrf_hash, expires_at, created_at)
SELECT sid_hash, admin_id, csrf_hash, expires_at, created_at FROM admin_sessions;

DROP TABLE admin_sessions;
ALTER TABLE admin_sessions_v2 RENAME TO admin_sessions;
