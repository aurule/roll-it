const { SlashCommandSubcommandBuilder, inlineCode } = require("discord.js")
const { oneLine } = require("common-tags")

const { longReply } = require("../../util/long-reply")
const commonOpts = require("../../util/common-options")
const { throwChoices, vsChoices } = require("../../util/met-throw-options")
const { compare, handleRequest } = require("../../services/met-roller")
const { present } = require("../../presenters/met-static-results-presenter")
const { injectMention } = require("../../util/inject-user")

module.exports = {
  name: "static",
  parent: "met",
  description: "Make a MET rock-paper-scissors roll",
  data: () =>
    new SlashCommandSubcommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption(commonOpts.description)
      .addStringOption((option) =>
        option
          .setName("throw")
          .setDescription("The symbol you want to use. Default is random.")
          .setChoices(...throwChoices(true)),
      )
      .addStringOption((option) =>
        option
          .setName("vs")
          .setDescription("Symbols your virtual opponent can use against you. Default is R/P/S.")
          .setChoices(...vsChoices),
      )
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  async execute(interaction) {
    const throw_request = interaction.options.getString("throw") ?? "rand"
    const vs_request = interaction.options.getString("vs") ?? "rand"
    const roll_description = interaction.options.getString("description") ?? ""
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const secret = interaction.options.getBoolean("secret") ?? false

    const thrown = handleRequest(throw_request, rolls)
    const vs = handleRequest(vs_request, rolls)

    const compared = thrown.map((first, idx) => compare(first, vs[idx]))

    const partial_message = present({
      rolls,
      thrown,
      vs,
      compared,
      description: roll_description,
    })
    const full_text = injectMention(partial_message, interaction.user.id)
    return longReply(interaction, full_text, { separator: "\n\t", ephemeral: secret })
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
        If you just want to get a random result for yourself and don't need a win/tie/lose result, you can
        set ${opts.vs} to ${inlineCode("None")}.
      `,
    ].join("\n")
  },
}
