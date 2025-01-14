const { oneLine } = require("common-tags")

const { LocalizedSubcommandBuilder } = require("../../util/localized-command")
const commonOpts = require("../../util/common-options")
const { throwChoices } = require("../../util/met-throw-options")
const { MetOpposedManager } = require("../../services/met-opposed-manager")
const { i18n } = require("../../locales")
const { canonical } = require("../../locales/helpers")

const command_name = "opposed"
const parent_name = "met"

module.exports = {
  name: command_name,
  parent: parent_name,
  description: canonical("description", `${parent_name}.${command_name}`),
  data: () => new LocalizedSubcommandBuilder(command_name, parent_name)
    .addLocalizedUserOption("opponent", (option) =>
      option.setRequired(true),
    )
    .addLocalizedStringOption("attribute", (option) =>
      option
        .setLocalizedChoices("mental", "social", "physical")
        .setRequired(true),
    )
    .addLocalizedStringOption("retest", (option) =>
      option
        .setRequired(true),
    )
    .addLocalizedStringOption("throw", (option) =>
      option
        .setChoices(...throwChoices)
        .setRequired(true),
    )
    .addStringOption(commonOpts.description)
    .addLocalizedBooleanOption("bomb")
    .addLocalizedBooleanOption("ties")
    .addLocalizedBooleanOption("cancels")
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
    manager.allow_retests = interaction.options.getBoolean("use-retests") ?? true
    manager.attacker.bomb = interaction.options.getBoolean("bomb") ?? false
    manager.attacker.ties = interaction.options.getBoolean("ties") ?? false
    manager.attacker.cancels = interaction.options.getBoolean("cancels") ?? false
    manager.current_test.chop(manager.attacker, interaction.options.getString("throw"))

    return manager.begin()
  },
  help({ command_name, ...opts }) {
    return [
      oneLine`
        ${command_name} starts an interactive challenge by prompting your ${opts.opponent} with the details of
        the challenge: the given ${opts.attribute} and your declared ${opts.bomb} and ${opts.ties}. They have
        the option to set their own ${opts.bomb} and ${opts.ties} before picking the symbol to use against
        your ${opts.throw}. They can also relent without contesting the challenge.
      `,
      "",
      oneLine`
        As the one who started the test, you can cancel it before your oppponent responds. This lets you
        quickly clear the challenge in case you tagged the wrong person, or realize the challenge isn't
        necessary.
      `,
      "",
      oneLine`
        Once your opponent responds, the symbols you both threw will be shown along with the current winner.
        The currently losing player at this point can try a retest, which lets you both choose a new symbol.
        The currently winning player can cancel that retest, if appropriate, before each picks a new symbol.
        As you retest back and forth, Roll It will show the entire history of the chops so you always know
        what's been thrown so far.
      `,
      "",
      oneLine`
        ${command_name} takes into account whether either of you has ${opts.ties}, i.e. a power that declares
        you win tied tests automatically. If neither of you has ties (or both of you have ties), then you'll
        have to compare bids on your own. Once you have, either player can retest or concede as appropriate.
      `,
    ].join("\n")
  },
}
