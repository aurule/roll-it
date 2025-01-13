const { inlineCode } = require("discord.js")
const { oneLine } = require("common-tags")

const { LocalizedSubcommandBuilder } = require("../../util/localized-command")
const commonOpts = require("../../util/common-options")
const { throwChoices, vsChoices } = require("../../util/met-throw-options")
const { compare, handleRequest } = require("../../services/met-roller")
const { present } = require("../../presenters/results/met-static-results-presenter")
const { injectMention } = require("../../util/formatters")
const { i18n } = require("../../locales")
const { canonical } = require("../../locales/helpers")

const command_name = "static"
const parent_name = "met"

module.exports = {
  name: command_name,
  parent: parent_name,
  description: canonical("description", `${parent_name}.${command_name}`),
  data: () => new LocalizedSubcommandBuilder(command_name, parent_name)
      .addStringOption(commonOpts.description)
      .addLocalizedStringOption("throw", (option) =>
        option
          .setChoices(...throwChoices(true)),
      )
      .addLocalizedStringOption("vs", (option) =>
        option
          .setChoices(...vsChoices),
      )
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
  help({ command_name, ...opts }) {
    return [
      oneLine`
        ${command_name} lets you make a static or simple test using MET rules. No options are required, so you
        can very quickly roll a random result vs a random result. If you want to pick the symbol you use
        instead of rolling your half randomly, just select it in the ${opts.throw} option.
      `,
      "",
      oneLine`
        The ${inlineCode("bomb")} advantage is available to both sides of the test. You can set the random
        picker to use rock-bomb-scissors for ${opts.throw} or for ${opts.vs}, in order to make a simple test
        against a more powerful opponent. You can also pick bomb directly for ${opts.throw}.
      `,
      "",
      oneLine`
        If you just want to get a random symbol for yourself and don't need a win/tie/lose result, you can
        set ${opts.vs} to ${inlineCode("None")}.
      `,
    ].join("\n")
  },
}
