CREATE TABLE IF NOT EXISTS stats.commands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  moment DATETIME NOT NULL,
  guildFlake TEXT NOT NULL,
  command TEXT NOT NULL
);
