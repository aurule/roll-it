const { SlashCommandBuilder, inlineCode, italic } = require("discord.js")
const { oneLine } = require("common-tags")
const Joi = require("joi")

const { roll } = require("../services/base-roller")
const { sum } = require("../services/tally")
const { present } = require("../presenters/d20-results-presenter")
const { pick } = require("../services/pick")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { longReply } = require("../util/long-reply")
const { injectMention } = require("../util/inject-user")

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
  savable: [
    "modifier",
    "keep",
    "rolls",
  ],
  schema: Joi.object({
    modifier: commonSchemas.modifier,
    keep: Joi.string()
      .optional()
      .valid("all", "highest", "lowest")
      .messages({
        "any.only": "Keep must be one of 'all', 'highest', or 'lowest'.",
      }),
    rolls: commonSchemas.rolls,
    description: commonSchemas.description,
  }),
  perform({keep, rolls, modifier, description}) {
    const pool = keep == "all" ? 1 : 2

    const raw_results = roll(pool, 20, rolls)
    const pick_results = pick(raw_results, 1, keep)

    return present({
      rolls,
      modifier,
      description,
      keep,
      raw: raw_results,
      picked: pick_results,
    })
  },
  execute(interaction) {
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const keep = interaction.options.getString("advantage") ?? "all"
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      rolls,
      modifier,
      description: roll_description,
      keep,
    })

    const full_text = injectMention(partial_message, interaction.user.id)
    return longReply(interaction, full_text, { separator: "\n\t", ephemeral: secret })
  },
  help({ command_name }) {
    return [
      `${command_name} rolls a single 20-sided die.`,
      "",
      oneLine`
        The ${inlineCode("advantage")} option lets you roll twice and take either the higher or lower result,
        like the D&D 5e mechanic of the same name. Set it to ${inlineCode("Advantage")} to use the higher
        result, and ${inlineCode("Disadvantage")} to use the lower.
      `,
    ].join("\n")
  },
}
