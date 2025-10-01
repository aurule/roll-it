const { LocalizedSubcommandBuilder } = require("../../util/localized-command")
const commonOpts = require("../../util/common-options")
const { opposedBegin } = require("../../interactive/opposed")
const { i18n } = require("../../locales")

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
      .addStringOption(commonOpts.description),
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
