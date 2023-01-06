const {
  SlashCommandBuilder,
} = require("discord.js")
const { stripIndent, oneLine } = require("common-tags")

const { logger } = require("../util/logger")
const { roll } = require("../services/base-roller")
const { present } = require("../presenters/eightball-results-presenter")

module.exports = {
  name: "eightball",
  description: "Get an answer from the Magic 8 Ball",
  data: () =>
    new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addStringOption((option) =>
        option
          .setName("question")
          .setRequired(true)
          .setDescription("The question you want to ask")
      )
      .addBooleanOption((option) =>
        option
          .setName("doit")
          .setDescription("Do it")
      )
      .addBooleanOption((option) =>
        option
          .setName("secret")
          .setDescription("Hide the result from everyone but you")
      ),
  async execute(interaction) {
    const question = interaction.options.getString("question")
    const doit = interaction.options.getBoolean("doit") ?? false
    const secret = interaction.options.getBoolean("secret") ?? false

    const raw_results = roll(1, 20, 1)

    return interaction.reply({
      content: present({
        question: question,
        doit: doit,
        raw: raw_results,
        userFlake: interaction.user.id,
      }),
      ephemeral: secret,
    })
  },
  help({ command_name }) {
    return `${command_name} asks a question of the Magic 8 Ball`
  },
}
