-- make the saved_rolls table
CREATE TABLE IF NOT EXISTS saved_rolls (
  id INTEGER PRIMARY KEY,
  guildFlake TEXT NOT NULL,
  userFlake TEXT NOT NULL,
  name TEXT,
  description TEXT,
  command TEXT,
  options BLOB,
  incomplete BOOL DEFAULT false,
  invalid BOOL DEFAULT false
);

-- multicol index for common lookups
-- speeds up querying by guildFlake, guild+user, or guild+user+name
CREATE UNIQUE INDEX IF NOT EXISTS saved_rolls_guild_user_name
ON saved_rolls (guildFlake, userFlake, name);

-- multicol index to enforce and lookup incomplete rolls
-- speeds up querying by guildFlake, guild+user, or guild+user+incomplete
CREATE UNIQUE INDEX IF NOT EXISTS saved_rolls_guild_user_incomplete
ON saved_rolls (guildFlake, userFlake) WHERE incomplete;
