const Joi = require("joi")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { roll } = require("../services/base-roller")
const { present } = require("../presenters/results/swn-results-presenter")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")
const { pickDice } = require("../services/pick")
const { pickedSum } = require("../services/tally")
const { i18n } = require("../locales")
const { canonical } = require("../locales/helpers")

const command_name = "swn"

module.exports = {
  name: command_name,
  description: canonical("description", command_name),
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addStringOption(commonOpts.description)
      .addLocalizedIntegerOption("modifier")
      .addLocalizedIntegerOption("pool", (option) => option.setMinValue(2))
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
  perform({ pool = 2, rolls = 1, modifier = 0, description, locale = "en-US" } = {}) {
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
      locale,
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
