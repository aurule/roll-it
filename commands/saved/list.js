const { MessageFlags } = require("discord.js")

const { LocalizedSubcommandBuilder } = require("../../util/localized-command")
const { presentList } = require("../../presenters/saved-roll-presenter")
const { UserSavedRolls } = require("../../db/saved_rolls")
const { i18n } = require("../../locales")
const { canonical } = require("../../locales/helpers")

const command_name = "list"
const parent_name = "saved"

module.exports = {
  name: command_name,
  parent: parent_name,
  description: canonical("description", `${parent_name}.${command_name}`),
  data: () => new LocalizedSubcommandBuilder(command_name, parent_name),
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
