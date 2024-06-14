const { SlashCommandBuilder, inlineCode, italic } = require("discord.js")
const { oneLine } = require("common-tags")

const { roll } = require("../services/base-roller")
const { sum } = require("../services/tally")
const { present } = require("../presenters/singleton-results-presenter")
const commonOpts = require("../util/common-options")
const { longReply } = require("../util/long-reply")

module.exports = {
  name: "d100",
  description: "Roll a single percentile (100-sided) die",
  data: () =>
    new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption(commonOpts.description)
      .addIntegerOption((option) =>
        option.setName("modifier").setDescription("A number to add to the die's result"),
      )
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  execute(interaction) {
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const raw_results = roll(1, 100, rolls)

    const full_text = present({
      rolls,
      modifier,
      description: roll_description,
      raw: raw_results,
      userFlake: interaction.user.id,
    })
    return longReply(interaction, full_text, {separator: "\n\t", ephemeral: secret})
  },
  help({ command_name }) {
    return oneLine`
      ${command_name} rolls a single percentile, or 100-sided, die. That's it!
      The results are indexed from 1 to 100.
    `
  },
}
