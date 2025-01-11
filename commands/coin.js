const { SlashCommandBuilder } = require("discord.js")
const Joi = require("joi")

const { roll } = require("../services/base-roller")
const { present } = require("../presenters/results/coin-results-presenter")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")
const { i18n } = require("../locales")
const { canonical, mapped } = require("../locales/helpers")

const command_name = "coin"

module.exports = {
  name: command_name,
  description: i18n.t("commands:coin.description"),
  data: () =>
    new SlashCommandBuilder()
      .setName(command_name)
      .setNameLocalizations(mapped("name", command_name))
      .setDescription(module.exports.description)
      .setDescriptionLocalizations(mapped("description", command_name))
      .addStringOption(commonOpts.description)
      .addStringOption((option) =>
        option
          .setName("call")
          .setNameLocalizations(mapped("name", command_name, option.name))
          .setDescription(canonical("description", command_name, option.name))
          .setDescriptionLocalizations(mapped("description", command_name, option.name))
          .setChoices(
            {
              name: canonical("choices.0.name", command_name, option.name),
              name_localizations: mapped("choices.0.name", command_name, option.name),
              value: "1",
            },
            {
              name: canonical("choices.0.name", command_name, option.name),
              name_localizations: mapped("choices.1.name", command_name, option.name),
              value: "2",
            }
          ),
      )
      .addBooleanOption(commonOpts.secret),
  schema: Joi.object({
    description: commonSchemas.description,
    call: Joi.string().optional().valid("1", "2").messages({
      "any.only": 'Call must be either "1" or "2".',
    }),
  }),
  perform({ description, call, locale = "en-US" }) {
    const raw_results = roll(1, 2, 1)

    return present({
      call,
      description,
      raw: raw_results,
      locale,
    })
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
  help({ command_name }) {
    return `${command_name} flips a single coin and displays the result as heads or tails.`
  },
}
