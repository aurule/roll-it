const { SlashCommandSubcommandBuilder } = require("discord.js")
const { presentList } = require("../../presenters/saved-roll-presenter")
const { UserSavedRolls } = require("../../db/saved_rolls")

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
    return interaction.paginate({
      content: full_text,
      split_on: "\n",
      ephemeral: true,
    })
  },
  help() {
    return [
      `:warning: marks incomplete rolls which are missing their name or options.`,
      `:x: marks rolls whose options are out of date`,
      "",
      `In either case, you'll need to update that roll's options in order to use it.`,
    ].join("\n")
  },
}
