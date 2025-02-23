const { LocalizedSubcommandBuilder } = require("../../util/localized-command")
const commonOpts = require("../../util/common-options")
const { throwChoices, vsChoices } = require("../../util/met-throw-options")
const { compare, handleRequest } = require("../../services/met-roller")
const { present } = require("../../presenters/results/met-static-results-presenter")
const { injectMention } = require("../../util/formatters")

const command_name = "static"
const parent_name = "met"

module.exports = {
  name: command_name,
  parent: parent_name,
  data: () =>
    new LocalizedSubcommandBuilder(command_name, parent_name)
      .addStringOption(commonOpts.description)
      .addLocalizedStringOption("throw", (option) => option.setChoices(...throwChoices))
      .addLocalizedStringOption("vs", (option) => option.setChoices(...vsChoices))
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  perform({
    throw_request = "rand",
    vs_request = "rand",
    description = "",
    rolls = 1,
    locale = "en-US",
  } = {}) {
    const thrown = handleRequest(throw_request, rolls)
    const vs = handleRequest(vs_request, rolls)

    const compared = thrown.map((elem, idx) => compare(elem, vs[idx]))

    return present({
      throw_request,
      vs_request,
      rolls,
      thrown,
      vs,
      compared,
      description,
      locale,
    })
  },
  async execute(interaction) {
    const throw_request = interaction.options.getString("throw") ?? "rand"
    const vs_request = interaction.options.getString("vs") ?? "rand"
    const roll_description = interaction.options.getString("description") ?? ""
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      throw_request,
      vs_request,
      description: roll_description,
      rolls,
      locale: interaction.locale,
    })
    const full_text = injectMention(partial_message, interaction.user.id)
    return interaction.paginate({
      content: full_text,
      split_on: "\n\t",
      secret,
    })
  },
}
