const Joi = require("joi")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { roll } = require("../services/base-roller")
const { sum } = require("../services/tally")
const { present } = require("../presenters/results/roll-results-presenter")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")

const command_name = "d10"

module.exports = {
  name: command_name,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addStringOption(commonOpts.description)
      .addLocalizedIntegerOption("modifier")
      .addIntegerOption(commonOpts.pool)
      .addIntegerOption(commonOpts.rolls)
      .addBooleanOption(commonOpts.secret),
  savable: true,
  changeable: ["modifier"],
  schema: Joi.object({
    description: commonSchemas.description,
    modifier: commonSchemas.modifier,
    pool: commonSchemas.pool,
    rolls: commonSchemas.rolls,
  }),
  perform({ rolls = 1, modifier = 0, pool = 1, description, locale = "en-US" } = {}) {
    const raw_results = roll(pool, 10, rolls)
    const summed_results = sum(raw_results)

    return present({
      rolls,
      pool,
      sides: 10,
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
    const description = interaction.options.getString("description") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      rolls,
      modifier,
      pool,
      description,
      locale: interaction.locale,
    })

    const full_text = injectMention(partial_message, interaction.user.id)
    return interaction.paginate({
      content: full_text,
      secret,
    })
  },
}
