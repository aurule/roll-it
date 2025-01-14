const { heading, MessageFlags } = require("discord.js")

const { LocalizedSubcommandBuilder } = require("../../util/localized-command")
const TopicNamePresenter = require("../../presenters/topic-name-presenter")
const topics = require("../../data").help_topics
const { i18n } = require("../../locales")
const { canonical } = require("../../locales/helpers")

const command_name = "topic"
const parent_name = "help"

module.exports = {
  name: command_name,
  parent: parent_name,
  description: canonical("description", `${parent_name}.${command_name}`),
  data: () =>
    new LocalizedSubcommandBuilder(command_name, parent_name).addLocalizedStringOption(
      "topic",
      (option) =>
        option
          .setChoices(
            ...topics.map((t) => {
              return { name: `${t.title}`, value: `${t.name}` }
            }),
          )
          .setRequired(true),
    ),
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
