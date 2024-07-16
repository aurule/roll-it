const { SlashCommandBuilder } = require("discord.js")
const Joi = require("joi")

const { roll } = require("../services/base-roller")
const { present } = require("../presenters/coin-results-presenter")
const commonOpts = require("../util/common-options")

module.exports = {
  name: "coin",
  description: "Flip a coin",
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
    description: Joi.string()
      .trim()
      .optional()
      .max(1500)
      .message("The description is too long. Keep it under 1500 characters."),
    call: Joi.string()
      // one of "heads" or "tails"
      .optional(),
  }),
  perform(userFlake, options) {
    const {description, call} = module.exports.schema.validate(options)

    const raw_results = roll(1, 2, 1)

    return present({
      call,
      description,
      raw: raw_results,
      userFlake,
    })
  },
  async execute(interaction) {
    const roll_description = interaction.options.getString("description") ?? ""
    const call = interaction.options.getString("call") ?? ""
    const secret = interaction.options.getBoolean("secret") ?? false

    const full_text = module.exports.perform(
      interaction.user.id,
      {
        call,
        description: roll_description,
      }
    )

    return interaction.reply({
      content: full_text,
      ephemeral: secret,
    })
  },
  help({ command_name }) {
    return `${command_name} flips a single coin and displays the result as heads or tails.`
  },
}
