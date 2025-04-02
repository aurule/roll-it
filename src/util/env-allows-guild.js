/**
 * Determine if we're running in the right environment to handle the given guild
 *
 * When in the "development" environment, this returns true only for guilds whose
 * snowflake appears in the DEV_GUILDS envvar. In all other environments, this
 * returns false for guilds in DEV_GUILDS and true for all other guilds.
 *
 * @param  {snowflake} guildId  Discord guild ID
 * @return {bool}               True if we should handle the guild, false if not
 */
function envAllowsGuild(guildId) {
  return (
    !(process.env.NODE_ENV !== "development") ==
    process.env.DEV_GUILDS.includes(guildId)
  )
}

module.exports = {
  envAllowsGuild,
}
