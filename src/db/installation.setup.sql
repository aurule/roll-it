-- Installation Tables
-- These are used in the process of installing Roll It onto a Discord server.

CREATE TABLE IF NOT EXISTS interactive.installation_processes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  locale TEXT NOT NULL,
  guild_uid TEXT NOT NULL,
  user_uid TEXT NOT NULL,
  state TEXT NOT NULL,
  old_systems blob NOT NULL,
  old_features blob NOT NULL,
  old_commands blob NOT NULL,
  new_systems BLOB,
  new_features BLOB,
  new_commands BLOB,
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
