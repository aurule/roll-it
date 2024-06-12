const { SlashCommandBuilder } = require("discord.js")
const { stripIndent, oneLine } = require("common-tags")

const { logger } = require("../util/logger")
const { roll } = require("../services/base-roller")
const { present } = require("../presenters/eightball-results-presenter")
const commonOpts = require("../util/common-options")

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
