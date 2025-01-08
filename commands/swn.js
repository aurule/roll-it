const { SlashCommandBuilder, inlineCode } = require("discord.js")
const { oneLine } = require("common-tags")
const Joi = require("joi")

const { roll } = require("../services/base-roller")
const { present } = require("../presenters/results/swn-results-presenter")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")
const { pickDice } = require("../services/pick")
const { pickedSum } = require("../services/tally")

module.exports = {
  name: "swn",
  description: "Roll and sum two six-sided dice using rules for Stars Without Number",
  data: () =>
    new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption(commonOpts.description)
      .addIntegerOption((option) =>
        option.setName("modifier").setDescription("A number to add to the die's result")
      )
      .addIntegerOption(option => option.setName("pool").setDescription("Number of dice to roll. Default 2.").setMinValue(2))
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  savable: true,
  changeable: ["modifier", "pool"],
  schema: Joi.object({
    pool: commonSchemas.pool.min(2),
    description: commonSchemas.description,
    modifier: commonSchemas.modifier,
    rolls: commonSchemas.rolls,
  }),
  perform({ pool = 2, rolls = 1, modifier = 0, description } = {}) {
    const raw_results = roll(pool, 6, rolls)
    const pick_results = pickDice(raw_results, 2, "highest")
    const summed_results = pickedSum(raw_results, pick_results)

    return present({
      rolls,
      modifier,
      description,
      raw: raw_results,
      picked: pick_results,
      summed: summed_results,
    })
  },
  execute(interaction) {
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const pool = interaction.options.getInteger("pool") ?? 2
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      pool,
      rolls,
      modifier,
      description: roll_description,
    })

    const full_text = injectMention(partial_message, interaction.user.id)
    return interaction.paginate({
      content: full_text,
      split_on: "\n\t",
      ephemeral: secret,
    })
  },
  help({ command_name, ...opts }) {
    return [
      oneLine`
        ${command_name} rolls two six-sided dice and adds the results, as appropriate for Stars Without Number
        and its sister games.
      `,
      "",
      oneLine`
        Occasionally, a character is able to roll 3 or more dice and keep the highest two. This is fully
        supported by using the ${opts.pool} option. When more than two dice are rolled using ${command_name},
        only the highest two are kept.
      `
    ].join("\n")
  },
}
