const { SlashCommandSubcommandBuilder } = require("discord.js")

const { longReply } = require("../../util/long-reply")
const commonOpts = require("../../util/common-options")
const { throwChoices, randomChoices } = require("../../util/met-throw-options")
const { roll, compare } = require("../../services/met-roller")
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
      .addStringOption((option) =>
        option
          .setName("throw")
          .setDescription("Choose what symbol you use")
          .setChoices(...throwChoices(true)),
      )
      .addStringOption((option) =>
        option
          .setName("vs")
          .setDescription("Choose what Roll It can use to oppose you")
          .setChoices(...randomChoices(true)),
      )
      .addStringOption(commonOpts.description)
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  async execute(interaction) {
    const throw_request = interaction.options.getString("throw") ?? "rand"
    const vs_request = interaction.options.getString("vs") ?? "rand"
    const roll_description = interaction.options.getString("description") ?? ""
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const secret = interaction.options.getBoolean("secret") ?? false

    switch(throw_request) {
      case "rand":
        thrown = roll(false, rolls)
        break
      case "rand-bomb":
        thrown = roll(true, rolls)
        break
      default:
        thrown = Array.from({length: rolls}, () => throw_request)
    }

    let vs
    if (vs_request == "rand") vs = roll(false, rolls)
    if (vs_request == "rand-bomb") vs = roll(true, rolls)

    const compared = thrown.map((first, idx) => compare(first, vs[idx]))

    const partial_message = present({
      rolls,
      thrown,
      vs,
      compared,
      description: roll_description
    })
    const full_text = injectMention(partial_message, interaction.user.id)
    return longReply(interaction, full_text, { separator: "\n\t", ephemeral: secret })
  },
  help({ command_name }) {
    return `undefined, against a random result`
  },
}
