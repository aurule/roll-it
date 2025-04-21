-- Teamwork Tables

CREATE TABLE IF NOT EXISTS interactive.teamwork_tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  command TEXT NOT NULL,
  options BLOB NOT NULL,
  leader TEXT NOT NULL,
  description TEXT,
  locale TEXT NOT NULL,
  channel_uid TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS interactive.teamwork_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_uid TEXT NOT NULL,
  message_type INTEGER DEFAULT 2,
  teamwork_id INTEGER NOT NULL,
  FOREIGN KEY (teamwork_id)
    REFERENCES teamwork_tests (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS interactive.teamwork_message_id
ON teamwork_messages (message_uid);

CREATE TABLE IF NOT EXISTS interactive.teamwork_helpers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_uid TEXT NOT NULL,
  requested BOOLEAN DEFAULT false,
  dice INTEGER,
  teamwork_id INTEGER NOT NULL,
  FOREIGN KEY (teamwork_id)
    REFERENCES teamwork_tests (id)
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS interactive.teamwork_helper_id
ON teamwork_helpers (teamwork_id, user_uid);

CREATE INDEX IF NOT EXISTS interactive.teamwork_helper_requested
ON teamwork_helpers (teamwork_id, requested);
