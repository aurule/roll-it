import { LocalizedSubcommandBuilder } from "../../util/localized-command.js"
import { list as listTopics } from "../../presenters/topic-name-presenter.js"
import { helpTopics } from "../../data/help-topics.js"
import { i18n } from "../../locales/index.js"

const command_name = "topic"
const parent_name = "help"

module.exports = {
  name: command_name,
  parent: parent_name,
  data: () =>
    new LocalizedSubcommandBuilder(command_name, parent_name).addLocalizedStringOption(
      "topic",
      (option) => option.setLocalizedChoices("about", "changes", "commands", "saved", "systems"),
    ),
  execute(interaction) {
    const topic_name = interaction.options.getString("topic") ?? ""

    const t = i18n.getFixedT(interaction.locale)

    const topic = helpTopics.get(topic_name)
    if (!topic)
      return interaction.whisper(
        t("commands:help.topic.options.topic.validation.unavailable", { topic_name }),
      )

    const data = {
      returnObjects: true,
    }
    if (topic.help_data) {
      Object.assign(data, topic.help_data(interaction.locale))
    }

    const topic_title = t(`help:${topic_name}.title`)
    const topic_body = t(`help:${topic_name}.lines`, data).join("\n")
    const full_text = t("help:topics.message", { title: topic_title, body: topic_body })
    return interaction.paginate({
      content: full_text,
      secret: true,
    })
  },
  help_data(opts) {
    return {
      topics: listTopics(opts.locale),
    }
  },
}
