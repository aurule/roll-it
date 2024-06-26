const { SlashCommandBuilder, italic, underscore } = require("discord.js")
const { stripIndent, oneLine } = require("common-tags")

const CommandChoicesTransformer = require("../transformers/command-choices-transformer")
const CommandHelpPresenter = require("../presenters/command-help-presenter")
const Topics = require("../help")
const { longReply } = require("../util/long-reply")

module.exports = {
  name: "roll-help",
  description: "Get help with Roll It and its commands",
  global: true,
  data() {
    const commands = require("./index")
    return new SlashCommandBuilder()
      .setName(module.exports.name)
      .setDescription(module.exports.description)
      .addSubcommand((subcommand) =>
        subcommand
          .setName("topic")
          .setDescription("Get help about a topic")
          .addStringOption((option) =>
            option
              .setName("topic")
              .setDescription("The topic you want help with")
              .setChoices(
                ...Topics.map((t) => {
                  return { name: `${t.title}`, value: `${t.name}` }
                }),
              )
              .setRequired(true),
          ),
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("command")
          .setDescription("Get help about a command")
          .addStringOption((option) =>
            option
              .setName("command")
              .setDescription("The command you want help with")
              .setChoices(...CommandChoicesTransformer.transform(commands))
              .setRequired(true),
          ),
      )
      .setDMPermission(true)
  },
  execute(interaction) {
    const command_name_arg = interaction.options.getString("command") ?? ""
    const topic_name = interaction.options.getString("topic") ?? ""

    if (topic_name) {
      const topic = Topics.get(topic_name)
      if (!topic)
        return interaction.reply({
          content: `No help is available for the topic "${topic_name}"`,
          ephemeral: true,
        })

      return interaction.reply({ content: topic.help(), ephemeral: true })
    }

    const command_name = command_name_arg || module.exports.name
    const command = interaction.client.commands.get(command_name)

    if (!command?.help)
      return interaction.reply({
        content: `No help is available for the command "${command_name}"`,
        ephemeral: true,
      })

    const full_text = CommandHelpPresenter.present(command)
    return longReply(interaction, full_text, { ephemeral: true })
  },
  help({ command_name }) {
    const commands = require("./index")
    return [
      oneLine`
        Both args let you pick from a list, so you don't need to memorize command or topic names. If you give
        both a command and a topic, ${command_name} will only show help for the topic.
      `,
      "",
      "Here are the available help topics:",
      Topics.map((t) => `• ${t.title} - ${italic(t.description)}`).join("\n"),
    ].join("\n")
  },
}
