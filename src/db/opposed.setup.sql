-- Met Opposed Tables

CREATE TABLE IF NOT EXISTS interactive.opposed_challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  locale TEXT NOT NULL,
  description TEXT,
  attacker_uid TEXT NOT NULL,
  attribute TEXT NOT NULL,
  retest_ability TEXT NOT NULL,
  conditions BLOB,
  summary TEXT,
  state TEXT NOT NULL,
  channel_uid TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
);

CREATE TABLE IF NOT EXISTS interactive.opposed_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_uid TEXT NOT NULL,
  mention TEXT NOT NULL,
  advantages BLOB,
  tie_winner BOOLEAN DEFAULT FALSE,
  ability_used BOOLEAN DEFAULT FALSE,
  role INTEGER NOT NULL,
  challenge_id INTEGER NOT NULL,
  FOREIGN KEY (challenge_id)
    REFERENCES opposed_challenges (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interactive.opposed_tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  locale TEXT NOT NULL,
  retester_id INTEGER,
  retest_reason TEXT,
  retested BOOLEAN DEFAULT FALSE,
  canceller_id INTEGER,
  cancelled_with TEXT,
  cancelled BOOLEAN DEFAULT FALSE,
  challenge_id INTEGER NOT NULL,
  history TEXT,
  breakdown TEXT,
  leader_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (challenge_id)
    REFERENCES opposed_challenges (id)
    ON DELETE CASCADE
  FOREIGN KEY (retester_id)
    REFERENCES opposed_participants (id)
  FOREIGN KEY (canceller_id)
    REFERENCES opposed_participants (id)
  FOREIGN KEY (leader_id)
    REFERENCES opposed_participants (id)
);

CREATE TABLE IF NOT EXISTS interactive.opposed_test_chops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request TEXT NOT NULL,
  result TEXT,
  ready BOOLEAN DEFAULT FALSE,
  traits INTEGER DEFAULT -1,
  tie_accepted BOOLEAN DEFAULT FALSE,
  participant_id INTEGER NOT NULL,
  test_id INTEGER NOT NULL,
  FOREIGN KEY (participant_id)
    REFERENCES opposed_participants (id)
  FOREIGN KEY (test_id)
    REFERENCES opposed_tests (id)
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS interactive.opposed_test_chop_participant
ON opposed_test_chops (test_id, participant_id);

CREATE TABLE IF NOT EXISTS interactive.opposed_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_uid TEXT NOT NULL,
  challenge_id INTEGER NOT NULL,
  test_id INTEGER,
  FOREIGN KEY (challenge_id)
    REFERENCES opposed_challenges (id)
    ON DELETE CASCADE
  FOREIGN KEY (test_id)
    REFERENCES opposed_tests (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS interactive.opposed_message_id
ON opposed_messages (message_uid);
