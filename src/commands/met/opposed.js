import { LocalizedSubcommandBuilder } from "../../util/localized-command.js"
import { opposedBegin } from "../../interactive/opposed.js"
import { descriptionOption } from "../../util/common-options.js"
import { i18n } from "../../locales/index.js"

const command_name = "opposed"
const parent_name = "met"

module.exports = {
  name: command_name,
  parent: parent_name,
  data: () =>
    new LocalizedSubcommandBuilder(command_name, parent_name)
      .addLocalizedUserOption("opponent", (option) => option.setRequired(true))
      .addLocalizedStringOption("attribute", (option) =>
        option.setLocalizedChoices("mental", "social", "physical").setRequired(true),
      )
      .addLocalizedStringOption("retest", (option) => option.setRequired(true))
      .addStringOption(descriptionOption),
  async execute(interaction) {
    const attackerId = interaction.user.id
    const defenderId = interaction.options.getUser("opponent").id

    const t = i18n.getFixedT(interaction.guild.locale, "commands", "met.opposed")

    if (attackerId === defenderId) {
      return interaction.whisper(t("options.opponent.validation.self"))
    }

    return opposedBegin({
      interaction,
      attackerId,
      defenderId,
      attribute: interaction.options.getString("attribute"),
      description: interaction.options.getString("description") ?? "",
      retest: interaction.options.getString("retest"),
    })
  },
}
