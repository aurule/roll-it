const { SlashCommandBuilder } = require("discord.js")
const Joi = require("joi")

const { roll } = require("../services/base-roller")
const { present } = require("../presenters/results/coin-results-presenter")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/formatters")
const { i18n } = require("../locales")

module.exports = {
  name: "coin",
  description: i18n.t("commands:coin.description"),
  data: () =>
    new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption(commonOpts.description)
      .addStringOption((option) =>
        option
          .setName("call")
          .setDescription("Pick which side you think the coin will land on")
          .setChoices({ name: "Heads", value: "heads" }, { name: "Tails", value: "tails" }),
      )
      .addBooleanOption(commonOpts.secret),
  schema: Joi.object({
    description: commonSchemas.description,
    call: Joi.string().optional().valid("heads", "tails").messages({
      "any.only": 'Call must be either "heads" or "tails".',
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
