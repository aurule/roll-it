-- make the rollables table
CREATE TABLE IF NOT EXISTS rollable (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guildFlake TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  die INTEGER,
  contents BLOB NOT NULL
);

-- multicol index starting with guildFlake
-- speeds up querying by guildFlake, or flake+name
CREATE UNIQUE INDEX IF NOT EXISTS rollable_guild_name
ON rollable (guildFlake, name);

-- set up the trigger to set the die size for new rollables
CREATE TRIGGER IF NOT EXISTS new_rollable_die
AFTER INSERT ON rollable
BEGIN
  UPDATE rollable SET die = JSON_ARRAY_LENGTH(NEW.contents) WHERE id = NEW.id;
END;

-- set up the trigger to set the die size for old rollables when their contents are changed
CREATE TRIGGER IF NOT EXISTS old_rollable_die
AFTER UPDATE OF contents ON rollable
BEGIN
  UPDATE rollable SET die = JSON_ARRAY_LENGTH(NEW.contents) WHERE id = NEW.id;
END;
