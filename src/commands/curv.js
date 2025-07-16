const Joi = require("joi")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { roll } = require("../services/base-roller")
const { present } = require("../presenters/results/curv-results-presenter")
const { keepFromArray, strategies } = require("../services/pick")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")
const { with_to_keep } = require("../util/with-to-keep")

const command_name = "curv"

module.exports = {
  name: command_name,
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
}
