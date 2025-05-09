-- Teamwork Tables

CREATE TABLE IF NOT EXISTS interactive.teamwork_tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  command TEXT NOT NULL,
  options BLOB NOT NULL,
  leader TEXT NOT NULL,
  description TEXT,
  locale TEXT NOT NULL,
  channel_uid TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
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

-- Met Opposed Tables

CREATE TABLE IF NOT EXISTS interactive.opposed (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  locale TEXT NOT NULL,
  attacker_uid TEXT NOT NULL,
  attribute TEXT NOT NULL,
  retests_allowed BOOLEAN DEFAULT true,
  retest_ability TEXT NOT NULL,
  carrier BOOLEAN DEFAULT false,
  altering BOOLEAN DEFAULT false,
  channel_uid TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
);

CREATE TABLE IF NOT EXISTS interactive.opposed_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_uid TEXT NOT NULL,
  mention TEXT NOT NULL,
  bomb BOOLEAN DEFAULT false,
  ties BOOLEAN DEFAULT false,
  cancels BOOLEAN DEFAULT false,
  opposed_id INTEGER NOT NULL,
  FOREIGN KEY (opposed_id)
    REFERENCES opposed (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interactive.opposed_tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  retester_uid TEXT,
  retest_reason TEXT,
  canceller_uid TEXT,
  cancelled_with TEXT,
  opposed_id INTEGER NOT NULL,
  done BOOLEAN DEFAULT false,
  FOREIGN KEY (opposed_id)
    REFERENCES opposed (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interactive.opposed_test_chops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request TEXT NOT NULL,
  result TEXT,
  participant_id INTEGER NOT NULL,
  test_id INTEGER NOT NULL,
  FOREIGN KEY (participant_id)
    REFERENCES opposed_participants (id)
    ON DELETE CASCADE
  FOREIGN KEY (test_id)
    REFERENCES opposed_tests (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interactive.opposed_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_uid TEXT NOT NULL,
  opposed_id INTEGER NOT NULL,
  test_id INTEGER NOT NULL,
  FOREIGN KEY (opposed_id)
    REFERENCES opposed (id)
    ON DELETE CASCADE
  FOREIGN KEY (test_id)
    REFERENCES opposed_tests (id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS interactive.opposed_message_id
ON opposed_messages (message_uid);
