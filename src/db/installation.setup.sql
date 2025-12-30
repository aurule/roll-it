-- Installation Tables
-- These are used in the process of installing Roll It onto a Discord server.

CREATE TABLE IF NOT EXISTS interactive.installation_processes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  locale TEXT NOT NULL,
  guild_uid TEXT NOT NULL,
  user_uid TEXT NOT NULL,
  old_deets BLOB NOT NULL,
  new_deets BLOB NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  finished_at DATETIME
);

CREATE TABLE IF NOT EXISTS interactive.installation_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_uid TEXT NOT NULL,
  installation_id INTEGER NOT NULL,
  FOREIGN KEY (installation_id)
    REFERENCES installation_processes (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS interactive.installation_message_id
ON installation_messages (message_uid);
