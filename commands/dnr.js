const { SlashCommandBuilder, inlineCode, italic, Collection } = require("discord.js")
const { stripIndent, oneLine } = require("common-tags")
const Joi = require("joi")

const { logger } = require("../util/logger")
const { roll } = require("../services/base-roller")
const {successes} = require("../services/tally")
const {present} = require("../presenters/dnr-results-presenter")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { longReply } = require("../util/long-reply")
const { injectMention } = require("../util/inject-user")

module.exports = {
  name: "dnr",
  description: "Roll pools of d6s for Don't Rest Your Head",
  data: () =>
    new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addIntegerOption((option) =>
        option
          .setName("discipline")
          .setDescription("Dice in your Dicipline pool")
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(6)
      )
      .addIntegerOption((option) =>
        option
          .setName("pain")
          .setDescription("Dice in the Pain pool")
          .setRequired(true)
          .setMinValue(1)
      )
      .addStringOption(commonOpts.description)
      .addIntegerOption((option) =>
        option
          .setName("exhaustion")
          .setDescription("Dice in your Exhaustion pool")
          .setMinValue(1)
          .setMinValue(6)
      )
      .addIntegerOption((option) =>
        option
          .setName("madness")
          .setDescription("Dice in your Madness pool")
          .setMinValue(1)
      )
      .addStringOption((option) =>
        option
          .setName("talent")
          .setDescription("Whether you're using a talent for this roll")
          .setChoices([
            {name: "Minor Exhaustion", value: "minor"},
            {name: "Major Exhaustion", value: "major"},
            {name: "Madness", value: "madness"},
          ])
      )
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  savable: true,
  changeable: ["modifier"],
  schema: Joi.object({
    discipline: Joi.number().required().integer().min(1).max(6),
    pain: Joi.number().required().integer().min(1).max(100),
    exhaustion: Joi.number().optional().integer().min(1).max(6)
      .when("talent", {
        is: Joi.string().valid("minor", "major"),
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    madness: Joi.number().integer().min(1).max(8)
      .when("talent", {
        is: Joi.string().valid("madness"),
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    talent: Joi.string().optional().valid("minor", "major", "madness")
      .default("none")
      .messages({
        "any.only": "Talent must be one of 'minor', 'major', or 'madness'.",
      }),
    description: commonSchemas.description,
    rolls: commonSchemas.rolls,
    modifier: commonSchemas.modifier,
  }),
  roll_pool(pool, pool_name) {
    if (!pool) return undefined

    const raw = roll(pool, 6)
    const summed = successes(raw, 4)

    return {
      name: pool_name,
      raw,
      summed,
      pool,
    }
  },
  perform({ discipline, pain, exhaustion, madness, talent, rolls = 1, description, modifier = 0} = {}) {
    const pool_options = new Collection([
      ["discipline", discipline],
      ["pain", pain],
      ["exhaustion", exhaustion + modifier],
      ["madness", madness],
    ])

    const tests = Array.from({ length: rolls }, (i) => {
      return pool_options.mapValues(module.exports.roll_pool)
    })

    return present({
      tests,
      description,
      rolls,
      talent,
    })
  },
  execute(interaction) {
    const discipline = interaction.options.getInteger("discipline") ?? 3
    const pain = interaction.options.getInteger("pain") ?? 1
    const exhaustion = interaction.options.getInteger("exhaustion") ?? 0
    const madness = interaction.options.getInteger("madness") ?? 0
    const talent = interaction.options.getString("talent") ?? ""
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      rolls,
      discipline,
      pain,
      exhaustion,
      madness,
      talent,
      description: roll_description,
    })

    const full_text = injectMention(partial_message, interaction.user.id)
    return longReply(interaction, full_text, { separator: "\n\t", ephemeral: secret })
  },
  help({ command_name }) {
    return oneLine`
      ${command_name} rolls a single round of rock-paper-scissors. The results are normally displayed using
      emoji and a word describing the outcome, like "\:rock: rock". The ${inlineCode("static")} option
      changes this to display pass, tie, or fail, to make it easier to interpret the result of an uncontested
      challenge. The ${inlineCode("bomb")} option replaces the paper result with bomb, which wins against
      rock and paper. Setting both ${inlineCode("static")} and ${inlineCode("bomb")} will display the result
      as pass, ${italic("pass")}, or fail, as the bomb result wins against the assumed paper result of the
      static opponent.
    `
  },
}
