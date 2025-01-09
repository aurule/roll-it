const { SlashCommandSubcommandBuilder, heading, MessageFlags } = require("discord.js")
const TopicNamePresenter = require("../../presenters/topic-name-presenter")
const topics = require("../../data").help_topics
const { i18n } = require("../../locales")

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

    const t = i18n.getFixedT(interaction.locale, "commands", "help.topic")

    const topic = topics.get(topic_name)
    if (!topic)
      return interaction.whisper(t("options.topic.validation.unavailable", { topic_name }))

    const full_text = heading(topic.title) + "\n" + topic.help()
    return interaction.paginate({
      content: full_text,
      secret: true,
    })
  },
  help() {
    return ["Here are the available help topics:", TopicNamePresenter.list()].join("\n")
  },
}
