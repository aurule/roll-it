import { LocalizedSubcommandBuilder } from "../../util/localized-command.js"
import { presentList } from "../../presenters/saved-roll-presenter.js"
import { UserSavedRolls } from "../../db/saved_rolls.js"

const command_name = "list"
const parent_name = "saved"

module.exports = {
  name: command_name,
  parent: parent_name,
  data: () => new LocalizedSubcommandBuilder(command_name, parent_name),
  async execute(interaction) {
    const saved_rolls = new UserSavedRolls(interaction.guildId, interaction.user.id)

    const full_text = presentList(saved_rolls.all(), interaction.locale)
    return interaction.paginate({
      content: full_text,
      secret: true,
    })
  },
}
