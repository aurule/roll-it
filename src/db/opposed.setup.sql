-- Met Opposed Tables

CREATE TABLE IF NOT EXISTS interactive.opposed_challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  locale TEXT NOT NULL,
  description TEXT,
  attacker_uid TEXT NOT NULL,
  attribute TEXT NOT NULL,
  retests_allowed BOOLEAN DEFAULT true,
  retest_ability TEXT NOT NULL,
  conditions BLOB,
  ties TEXT,
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
  role INTEGER NOT NULL,
  challenge_id INTEGER NOT NULL,
  FOREIGN KEY (challenge_id)
    REFERENCES opposed_challenges (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interactive.opposed_tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  retester_id TEXT,
  retest_reason TEXT,
  canceller_id TEXT,
  cancelled_with TEXT,
  challenge_id INTEGER NOT NULL,
  state integer NOT NULL DEFAULT 0,
  history TEXT,
  breakdown TEXT,
  leader_id TEXT,
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

CREATE TABLE IF NOT EXISTS interactive.opposed_test_bids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  traits INTEGER NOT NULL,
  ready BOOLEAN DEFAULT FALSE,
  participant_id INTEGER NOT NULL,
  test_id INTEGER NOT NULL,
  FOREIGN KEY (participant_id)
    REFERENCES opposed_participants (id)
  FOREIGN KEY (test_id)
    REFERENCES opposed_tests (id)
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS interactive.opposed_test_bid_participant
ON opposed_test_bids (test_id, participant_id);

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
