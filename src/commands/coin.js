const Joi = require("joi")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { roll } = require("../services/base-roller")
const { present } = require("../presenters/results/coin-results-presenter")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")
const sacrifice = require("../services/easter-eggs/sacrifice")

const command_name = "coin"

module.exports = {
  name: command_name,
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addStringOption(commonOpts.description)
      .addLocalizedStringOption("call", (option) => option.setLocalizedChoices("1", "2"))
      .addBooleanOption(commonOpts.secret),
  schema: Joi.object({
    description: commonSchemas.description,
    call: Joi.string().optional().valid("1", "2").messages({
      "any.only": 'Call must be either "1" or "2".',
    }),
  }),
  judge(raw_results, call, locale) {
    if (call === "") return ""

    const result = raw_results[0][0]
    if (call == result) return sacrifice.good(locale)
    return sacrifice.bad(locale)
  },
  perform({ description, call, locale = "en-US" }) {
    const raw_results = roll(1, 2, 1)

    const presented_result = present({
      call,
      description,
      raw: raw_results,
      locale,
    })

    if (sacrifice.hasTrigger(description, locale)) {
      const sacrifice_message = module.exports.judge(raw_results, call, locale);
      return `${presented_result}\n-# ${sacrifice_message}`
    }

    return presented_result
  },
  async execute(interaction) {
    const roll_description = interaction.options.getString("description") ?? ""
    const call = interaction.options.getString("call") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({
      call,
      description: roll_description,
      locale: interaction.locale,
    })

    return interaction.rollReply(injectMention(partial_message, interaction.user.id), secret)
  },
}
