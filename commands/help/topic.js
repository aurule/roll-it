const { SlashCommandSubcommandBuilder, heading } = require("discord.js")
const TopicNamePresenter = require("../../presenters/topic-name-presenter")
const topics = require("../../data").help_topics

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
            ...topics.map((t) => {
              return { name: `${t.title}`, value: `${t.name}` }
            }),
          )
          .setRequired(true),
      )
  },
  execute(interaction) {
    const topic_name = interaction.options.getString("topic") ?? ""

    const topic = topics.get(topic_name)
    if (!topic) return interaction.whisper(`No help is available for the topic "${topic_name}"`)

    const full_text = heading(topic.title) + "\n" + topic.help()
    return interaction.paginate({
      content: full_text,
      ephemeral: true,
    })
  },
  help() {
    return ["Here are the available help topics:", TopicNamePresenter.list()].join("\n")
  },
}
