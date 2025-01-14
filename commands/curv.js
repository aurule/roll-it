const { inlineCode } = require("discord.js")
const { oneLine } = require("common-tags")
const Joi = require("joi")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { roll } = require("../services/base-roller")
const { present } = require("../presenters/results/curv-results-presenter")
const { keepFromArray, strategies } = require("../services/pick")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")
const { i18n } = require("../locales")
const { canonical, mapped } = require("../locales/helpers")

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

const command_name = "curv"

module.exports = {
  name: command_name,
  description: canonical("description", command_name),
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addStringOption(commonOpts.description)
      .addLocalizedIntegerOption("modifier")
      .addLocalizedStringOption("with", (option) =>
        option.setLocalizedChoices("advantage", "disadvantage"),
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
  perform({
    keep = "all",
    rolls = 1,
    modifier = 0,
    locale = "en-US",
    description,
    ...others
  } = {}) {
    if (others.with) keep = with_to_keep(others.with)

    const advantage_rolls = keep == "all" ? 1 : 2
    const raw_results = Array.from({ length: rolls }, () => roll(3, 6, advantage_rolls))
    const sums = raw_results.map((roll_set) => {
      return roll_set.map((result) => {
        return result.reduce((acc, curr) => acc + curr, 0)
      })
    })
    const picked_results = sums.map((sum) => keepFromArray(sum, 1, keep).indexes[0])

    return present({
      rolls,
      picked: picked_results,
      sums,
      modifier,
      description,
      keep,
      raw: raw_results,
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
      secret,
    })
  },
  help({ command_name, ...opts }) {
    return [
      `${command_name} rolls 3d6 in place of a d20.`,
      "",
      oneLine`
        The three dice in each pool are added up to get the roll's result. This gives the result a strong
        average instead of the extremes of a single d20.
      `,
      "",
      oneLine`
        Since the chances of any result are changed, a "natural" 20 or natural 1 is too rare to work normally.
        Instead, a critical success is when a roll scores 16 or more on the dice, before adding the modifier.
        A critical failure is when a roll scores 5 or less on the dice.
      `,
      "",
      oneLine`
        The ${opts.with} option lets you roll two pools and take either the higher or lower result, using the
        D&D 5e mechanic of advantage. Set it to ${inlineCode("Advantage")} to use the higher result, and
        ${inlineCode("Disadvantage")} to use the lower.
      `,
    ].join("\n")
  },
}
