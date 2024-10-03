-- make the feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userFlake TEXT NOT NULL,
  content TEXT NOT NULL,
  guildFlake TEXT,
  commandName TEXT,
  canReply BOOL DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  resolution TEXT
);

CREATE INDEX IF NOT EXISTS feedback_user
ON feedback (userFlake);

CREATE INDEX IF NOT EXISTS feedback_guild
ON feedback (guildFlake);
