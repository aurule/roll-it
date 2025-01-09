const { SlashCommandSubcommandBuilder, MessageFlags } = require("discord.js")
const { presentList } = require("../../presenters/saved-roll-presenter")
const { UserSavedRolls } = require("../../db/saved_rolls")
const { i18n } = require("../../locales")

module.exports = {
  name: "list",
  parent: "saved",
  description: i18n.t("commands:saved.list.description"),
  data: () =>
    new SlashCommandSubcommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description),
  async execute(interaction) {
    const saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)

    const t = i18n.getFixedT(interaction.locale, "commands", "saved")

    const full_text = presentList(saved_rolls.all(), t)
    return interaction.paginate({
      content: full_text,
      split_on: "\n",
      secret: true,
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
