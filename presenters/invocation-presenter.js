const { inlineCode } = require("discord.js")

module.exports = {
  /**
   * Present a command invocation
   *
   * This turns a command name and options object into a discord command invocation string. The goal is for
   * this string to be able to be pasted into discord and executed as-is.
   *
   * Due to this, it only makes sense to use command names which are slash commands.
   *
   * @param  {str} command_name Name of the command to execute
   * @param  {obj} options      Object of options for the invocation
   * @return {str}              Full invocation line
   */
  present(command_name, options) {
    let contents = `/${command_name}`
    for (const opt in options) {
      contents += ` ${opt}:${options[opt]}`
    }
    return inlineCode(contents)
  }
}
