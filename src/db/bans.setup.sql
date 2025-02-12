-- make the bans table
CREATE TABLE IF NOT EXISTS bans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userFlake TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  lifted_at DATETIME,
  lifted_reason TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS bans_user
ON bans (userFlake, lifted_at);
