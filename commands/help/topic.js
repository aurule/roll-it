const { heading } = require("discord.js")

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

    const t = i18n.getFixedT(interaction.locale)

    const topic = topics.get(topic_name)
    if (!topic)
      return interaction.whisper(t("commands:help.topic.options.topic.validation.unavailable", { topic_name }))

    const data = {
      returnObjects: true,
    }
    if (topic.help_data) {
      Object.assign(data, topic.help_data(interaction.locale))
    }

    const topic_title = t(`help:${topic_name}.title`)
    const topic_body = t(`help:${topic_name}.lines`, data).join("\n")
    const full_text = t('help:topics.message', { title: topic_title, body: topic_body })
    return interaction.paginate({
      content: full_text,
      secret: true,
    })
  },
  help_data(opts) {
    return {
      topics: TopicNamePresenter.list(opts.locale),
    }
  },
}
