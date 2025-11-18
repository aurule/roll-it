const { LocalizedSubcommandBuilder } = require("../../util/localized-command")
const commonOpts = require("../../util/common-options")
const { injectMention } = require("../../util/formatters")
const { DndAttack } = require("../../util/rolls/dnd-attack")
const { presentAttack } = require("../../presenters/results/dnd-results-presenter")

const command_name = "attack"
const parent_name = "dnd"

module.exports = {
  name: command_name,
  parent: parent_name,
  data: () =>
    new LocalizedSubcommandBuilder(command_name, parent_name)
      .addLocalizedIntegerOption("modifier", (option) => option.setRequired(true))
      .addStringOption(commonOpts.description)
      .addLocalizedIntegerOption("crit", (option) => option.setMinValue(0).setMaxValue(20))
      .addLocalizedIntegerOption("ac", (option) => option.setMinValue(1))
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  perform({
    modifier = 0,
    crit = 20,
    ac = 0,
    description = "",
    rolls = 1,
    locale = "en-US",
  } = {}) {
    const attacks = Array.from({ length: rolls }, () => new DndAttack(modifier, crit))

    const presented_results = presentAttack({
      attacks,
      modifier,
      crit,
      ac,
      rolls,
      description,
      locale,
    })

    // this space reserved for easter eggs

    return presented_results
  },
  async execute(interaction) {
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const crit = interaction.options.getInteger("crit") ?? 20
    const ac = interaction.options.getInteger("ac") ?? 0
    const description = interaction.options.getString("description") ?? ""
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      modifier,
      crit,
      ac,
      description,
      rolls,
      locale: interaction.locale,
    })
    const full_text = injectMention(partial_message, interaction.user.id)
    return interaction.paginate({
      content: full_text,
      secret,
    })
  },
}
