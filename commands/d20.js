const { SlashCommandBuilder, inlineCode } = require("discord.js")
const { oneLine } = require("common-tags")
const Joi = require("joi")

const { roll } = require("../services/base-roller")
const { present } = require("../presenters/d20-results-presenter")
const { pickDice, strategies } = require("../services/pick")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")

function with_to_keep(value) {
  switch (value) {
    case "advantage":
      return "highest"
    case "disadvantage":
      return "lowest"
    default:
      return "all"
  }
}

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
          .setName("with")
          .setDescription(
            "Roll with Advantage or Disadvantage from D&D 5e by keeping the highest or lowest of 2d20",
          )
          .setChoices(
            { name: "Advantage", value: "advantage" },
            { name: "Disadvantage", value: "disadvantage" },
          ),
      )
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  savable: true,
  changeable: ["modifier"],
  schema: Joi.object({
    modifier: commonSchemas.modifier,
    keep: Joi.string()
      .optional()
      .valid(...strategies)
      .messages({
        "any.only": "Keep must be one of 'all', 'highest', or 'lowest'.",
      }),
    with: Joi.string().optional().valid("advantage", "disadvantage"),
    rolls: commonSchemas.rolls,
    description: commonSchemas.description,
  }).oxor("keep", "with"),
  perform({ keep = "all", rolls = 1, modifier = 0, locale = "en-US", description, ...others } = {}) {
    if (others.with) keep = with_to_keep(others.with)

    const pool = keep == "all" ? 1 : 2

    const raw_results = roll(pool, 20, rolls)
    const pick_results = pickDice(raw_results, 1, keep)

    return present({
      rolls,
      modifier,
      description,
      keep,
      raw: raw_results,
      picked: pick_results,
      locale,
    })
  },
  with_to_keep,
  execute(interaction) {
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const keep = with_to_keep(interaction.options.getString("with"))
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      rolls,
      modifier,
      description: roll_description,
      keep,
      locale: interaction.locale,
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
      `${command_name} rolls a single 20-sided die.`,
      "",
      oneLine`
        The ${opts.with} option lets you roll twice and take either the higher or lower result, using the D&D
        5e mechanic of advantage. Set it to ${inlineCode("Advantage")} to use the higher result, and
        ${inlineCode("Disadvantage")} to use the lower.
      `,
      "",
      oneLine`
        The invocation for ${command_name} can use either ${inlineCode("keep")} or ${opts.with}, but not both.
      `,
    ].join("\n")
  },
}
