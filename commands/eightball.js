const { SlashCommandBuilder } = require("discord.js")
const { stripIndent, oneLine } = require("common-tags")
const Joi = require("joi")

const { logger } = require("../util/logger")
const { roll } = require("../services/base-roller")
const { present } = require("../presenters/eightball-results-presenter")
const commonOpts = require("../util/common-options")
const commonSchemas = require("../util/common-schemas")
const { injectMention } = require("../util/inject-user")

module.exports = {
  name: "eightball",
  description: "Get an answer from the Magic 8 Ball",
  data: () =>
    new SlashCommandBuilder()
      .setName(module.exports.name)
      .addStringOption((option) =>
        option.setName("question").setRequired(true).setDescription("The question you want to ask"),
      )
      .setDescription(module.exports.description)
      .addBooleanOption((option) => option.setName("doit").setDescription("Do it"))
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
  perform({ question, doit }) {
    const raw_results = roll(1, 20, 1)

    return present({
      question,
      doit,
      raw: raw_results,
    })
  },
  async execute(interaction) {
    const question = interaction.options.getString("question")
    const doit = interaction.options.getBoolean("doit") ?? false
    const secret = interaction.options.getBoolean("secret") ?? false

    const partial_message = module.exports.perform({ question, doit })
    const full_text = injectMention(partial_message, interaction.user.id)
    return interaction.reply({
      content: full_text,
      ephemeral: secret,
    })
  },
  help({ command_name }) {
    return `${command_name} asks a question of the Magic 8 Ball.`
  },
}
