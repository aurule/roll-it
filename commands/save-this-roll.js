const { ContextMenuCommandBuilder, ApplicationCommandType, inlineCode, italic } = require("discord.js")

module.exports = {
  name: "Save this roll",
  description: "Save a roll you've made to reuse it later",
  type: "menu",
  data: () =>
    new ContextMenuCommandBuilder()
      .setName(module.exports.name)
      .setType(ApplicationCommandType.Message),
  execute(interaction) {
    // error if command is missing or not savable
    // parse message
    // error if parse fails
    // upsert the command and incomplete flag
    // get details
    // reply with instructions or success
  },
  help({ command_name }) {
    return "WIP"
  }
}
