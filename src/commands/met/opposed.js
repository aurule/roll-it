const { LocalizedSubcommandBuilder } = require("../../util/localized-command")
const commonOpts = require("../../util/common-options")
const { throwChoices } = require("../../util/met-throw-options")
const { MetOpposedManager } = require("../../services/met-opposed-manager")
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
      .addLocalizedStringOption("throw", (option) =>
        option.setChoices(...throwChoices).setRequired(true),
      )
      .addStringOption(commonOpts.description)
      .addLocalizedBooleanOption("bomb")
      .addLocalizedBooleanOption("ties")
      .addLocalizedBooleanOption("cancels")
      .addLocalizedBooleanOption("carrier")
      .addLocalizedBooleanOption("altering")
      .addLocalizedBooleanOption("use-retests"),
  async execute(interaction) {
    const attackerId = interaction.user.id
    const defenderId = interaction.options.getUser("opponent").id

    const t = i18n.getFixedT(interaction.locale, "commands", "met.opposed")

    if (attackerId === defenderId) {
      return interaction.whisper(t("options.opponent.validation.self"))
    }

    const manager = new MetOpposedManager({
      interaction,
      attackerId,
      defenderId,
      attribute: interaction.options.getString("attribute"),
      retest_ability: interaction.options.getString("retest"),
    })
    manager.description = interaction.options.getString("description") ?? ""
    manager.carrier = interaction.options.getBoolean("carrier") ?? false
    manager.altering = interaction.options.getBoolean("altering") ?? false
    manager.allow_retests = interaction.options.getBoolean("use-retests") ?? true
    manager.attacker.bomb = interaction.options.getBoolean("bomb") ?? false
    manager.attacker.ties = interaction.options.getBoolean("ties") ?? false
    manager.attacker.cancels = interaction.options.getBoolean("cancels") ?? false
    manager.current_test.chop(manager.attacker, interaction.options.getString("throw"))

    return manager.begin()
  },
}
