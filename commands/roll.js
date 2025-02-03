const Joi = require("joi")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { roll } = require("../services/base-roller")
const { sum } = require("../services/tally")
const { present } = require("../presenters/results/roll-results-presenter")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")

const command_name = "roll"

module.exports = {
  name: command_name,
  global: true,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addIntegerOption((opt) => commonOpts.pool(opt).setRequired(true))
      .addLocalizedIntegerOption("sides", (option) => option.setMinValue(2).setRequired(true))
      .addStringOption(commonOpts.description)
      .addLocalizedIntegerOption("modifier")
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  savable: true,
  changeable: ["modifier", "pool"],
  schema: Joi.object({
    pool: commonSchemas.pool,
    sides: Joi.number().required().integer().min(2).max(100000),
    description: commonSchemas.description,
    modifier: commonSchemas.modifier,
    rolls: commonSchemas.rolls,
  }),
  perform({ pool, sides, description, modifier = 0, rolls = 1, locale = "en-US" } = {}) {
    const raw_results = roll(pool, sides, rolls)
    const summed_results = sum(raw_results)

    return present({
      rolls,
      pool,
      sides,
      modifier,
      description,
      raw: raw_results,
      summed: summed_results,
      locale,
    })
  },
  execute(interaction) {
    const pool = interaction.options.getInteger("pool")
    const sides = interaction.options.getInteger("sides")
    const modifier = interaction.options.getInteger("modifier") ?? 0
    const rolls = interaction.options.getInteger("rolls") ?? 1
    const roll_description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      rolls,
      pool,
      sides,
      modifier,
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
}
