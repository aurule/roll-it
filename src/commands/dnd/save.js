const { LocalizedSubcommandBuilder } = require("../../util/localized-command")
const commonOpts = require("../../util/common-options")
const { injectMention } = require("../../util/formatters")
const { roll } = require("../../services/base-roller")
const { presentSave } = require("../../presenters/results/dnd-results-presenter")

const command_name = "save"
const parent_name = "dnd"

module.exports = {
  name: command_name,
  parent: parent_name,
  data: () =>
    new LocalizedSubcommandBuilder(command_name, parent_name)
      .addStringOption(commonOpts.description)
      .addLocalizedIntegerOption("modifier")
      .addLocalizedIntegerOption("dc", (option) =>
        option.setMinValue(1),
      )
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  perform({ modifier = 0, dc = 0, description = "", rolls = 1, locale = "en-US" } = {}) {
    const raw_results = roll(1, 20, rolls)
    const presented_results = presentSave({
      raw: raw_results,
      modifier,
      dc,
      rolls,
      description,
      locale,
    })

    // this space reserved for easter eggs

    return presented_results
  },
  async execute(interaction) {
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const dc = interaction.options.getInteger("dc") ?? 0
    const description = interaction.options.getString("description") ?? ""
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      modifier,
      dc,
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
