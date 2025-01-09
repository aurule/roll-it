const { SlashCommandBuilder } = require("discord.js")
const { oneLine } = require("common-tags")
const Joi = require("joi")

const { roll } = require("../services/base-roller")
const { sum } = require("../services/tally")
const { present } = require("../presenters/results/roll-results-presenter")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")

module.exports = {
  name: "d6",
  description: "Roll some six-sided dice",
  data: () =>
    new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption(commonOpts.description)
      .addIntegerOption((option) =>
        option
          .setName("modifier")
          .setDescription("Number to add to the result after adding up the rolled dice"),
      )
      .addIntegerOption(commonOpts.pool)
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  savable: true,
  changeable: ["modifier"],
  schema: Joi.object({
    description: commonSchemas.description,
    modifier: commonSchemas.modifier,
    rolls: commonSchemas.rolls,
  }),
  perform({ rolls = 1, modifier = 0, pool = 1, description, locale = "en-US" } = {}) {
    const raw_results = roll(pool, 6, rolls)
    const summed_results = sum(raw_results)

    return present({
      rolls,
      pool,
      sides: 6,
      modifier,
      description,
      raw: raw_results,
      summed: summed_results,
      locale,
    })
  },
  execute(interaction) {
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const pool = interaction.options.getInteger("pool") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      rolls,
      modifier,
      pool,
      description: roll_description,
      locale: interaction.locale,
    })

    const full_text = injectMention(partial_message, interaction.user.id)
    return interaction.paginate({
      content: full_text,
      split_on: "\n\t",
      secret,
    })
  },
  help({ command_name }) {
    return oneLine`
      ${command_name} rolls one or more six-sided dice. That's it! The results are indexed from 1 to 6.
    `
  },
}
