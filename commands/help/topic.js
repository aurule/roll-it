const { SlashCommandSubcommandBuilder } = require("discord.js")
const TopicNamePresenter = require("../../presenters/topic-name-presenter")
const Topics = require("../../help")
const { longReply } = require("../../util/long-reply")

module.exports = {
  name: "topic",
  parent: "help",
  description: "Get help about a topic",
  data() {
    return new SlashCommandSubcommandBuilder()
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
      )
  },
  execute(interaction) {
    const topic_name = interaction.options.getString("topic") ?? ""

    const topic = Topics.get(topic_name)
    if (!topic)
      return interaction.reply({
        content: `No help is available for the topic "${topic_name}"`,
        ephemeral: true,
      })

    const full_text = topic.help()
    return longReply(interaction, full_text, { ephemeral: true })
  },
  help({ command_name }) {
    return ["Here are the available help topics:", TopicNamePresenter.list()].join("\n")
  },
}
