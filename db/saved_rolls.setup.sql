-- make the saved_rolls table
CREATE TABLE IF NOT EXISTS saved_rolls (
  id INTEGER PRIMARY KEY,
  guildFlake TEXT NOT NULL,
  userFlake TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  incomplete BOOL DEFAULT false,
  invalid BOOL DEFAULT false,
  command TEXT NOT NULL,
  options BLOB NOT NULL
);

-- multicol index starting with guildFlake
-- speeds up querying by guildFlake, guild+user, or guild+user+name
CREATE UNIQUE INDEX IF NOT EXISTS saved_rolls_guild_user_name
ON saved_rolls (guildFlake, userFlake, name);
