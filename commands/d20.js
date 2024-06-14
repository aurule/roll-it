const { SlashCommandBuilder, inlineCode, italic } = require("discord.js")

const { roll } = require("../services/base-roller")
const { sum } = require("../services/tally")
const { present } = require("../presenters/d20-results-presenter")
const { pick } = require("../services/pick")
const commonOpts = require("../util/common-options")
const { longReply } = require("../util/long-reply")

module.exports = {
  name: "d20",
  description: "Roll a single 20-sided die",
  data: () =>
    new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption(commonOpts.description)
      .addIntegerOption((option) =>
        option.setName("modifier").setDescription("A number to add to the die's result"),
      )
      .addStringOption((option) =>
        option
          .setName("advantage")
          .setDescription(
            "Roll with Advantage or Disadvantage from D&D 5e: rolls 2d20 and keeps the higher or lower.",
          )
          .setChoices(
            { name: "Advantage", value: "highest" },
            { name: "Disadvantage", value: "lowest" },
          ),
      )
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  execute(interaction) {
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const keep = interaction.options.getString("advantage") ?? "all"
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const pool = keep == "all" ? 1 : 2

    const raw_results = roll(pool, 20, rolls)
    const pick_results = keep ? pick(raw_results, 1, keep) : {}

    const full_text = present({
        rolls,
        modifier,
        description: roll_description,
        raw: raw_results,
        picked: pick_results,
        userFlake: interaction.user.id,
      })
    return longReply(interaction, full_text, {separator: "\n\t", ephemeral: secret})
  },
  help({ command_name }) {
    return `${command_name} rolls a single 20-sided die. That's it!`
  },
}
