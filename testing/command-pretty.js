/**
 * Pretty-print a command name
 *
 * Subcommands are first prefixed with their parent name
 *
 * @param  {Object} command The command object to present
 * @return {str}            Pretty-printed command name
 */
function pretty(command) {
  let presented = "/"
  if (command.parent) presented += command.parent + " "
  presented += command.name
  return presented
}

module.exports = {
  pretty,
}
