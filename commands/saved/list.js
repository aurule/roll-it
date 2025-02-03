const { LocalizedSubcommandBuilder } = require("../../util/localized-command")
const { presentList } = require("../../presenters/saved-roll-presenter")
const { UserSavedRolls } = require("../../db/saved_rolls")
const { i18n } = require("../../locales")

const command_name = "list"
const parent_name = "saved"

module.exports = {
  name: command_name,
  parent: parent_name,
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
}
