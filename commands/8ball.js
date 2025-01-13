const Joi = require("joi")

const { LocalizedSlashCommandBuilder } = require("../util/localized-command")
const { roll } = require("../services/base-roller")
const { present } = require("../presenters/results/8ball-results-presenter")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")
const { i18n } = require("../locales")
const { canonical } = require("../locales/helpers")

const command_name = "8ball"

module.exports = {
  name: command_name,
  description: canonical("description", command_name),
  data: () =>
    new LocalizedSlashCommandBuilder(command_name)
      .addLocalizedStringOption("question", (option) =>
        option.setRequired(true)
      )
      .addLocalizedBooleanOption("doit")
      .addBooleanOption(commonOpts.secret),
  schema: Joi.object({
    question: Joi.string()
      .trim()
      .required()
      .max(1500)
      .message("The question is too long. Keep it under 1500 characters."),
    description: commonSchemas.description,
    doit: Joi.boolean().optional(),
  }),
  perform({ question, doit, locale = "en-US" }) {
    const raw_results = roll(1, 20, 1)

    return present({
      question,
      doit,
      raw: raw_results,
      locale,
    })
  },
  async execute(interaction) {
    const question = interaction.options.getString("question")
    const doit = interaction.options.getBoolean("doit") ?? false
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({ question, doit, locale: interaction.locale })
    const full_text = injectMention(partial_message, interaction.user.id)
    return interaction.rollReply(full_text, secret)
  },
  help({ command_name }) {
    return `${command_name} asks a question of the Magic 8 Ball.`
  },
}
