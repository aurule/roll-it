const { SlashCommandSubcommandBuilder } = require("discord.js")
const { presentList } = require("../../presenters/saved-roll-presenter")
const { longReply } = require("../../util/long-reply")
const { UserSavedRolls } = require("../../db/saved_rolls")
const { oneLine } = require("common-tags")

module.exports = {
  name: "list",
  parent: "saved",
  description: "List the rolls you've saved on this server",
  data: () =>
    new SlashCommandSubcommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description),
  async execute(interaction) {
    const saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)

    const full_text = presentList(saved_rolls.all())

    return longReply(interaction, full_text, { separator: "\n", ephemeral: true })
  },
  help({ command_name }) {
    return [
      `:warning: marks incomplete rolls which are missing their name or options.`,
      `:x: marks rolls whose options are out of date`,
      "",
      `In either case, you'll need to update that roll's options in order to use it.`,
    ].join("\n")
  },
}
