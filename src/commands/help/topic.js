import { list as listTopics } from "../../presenters/topic-name-presenter.js"
import { helpTopics } from "../../data/help-topics.js"
import { i18n } from "../../locales/index.js"
import { Command } from "../abstract/command.js"
import { Child } from "../abstract/child-command.js"

/**
 * Class for the help topic command
 */
export const Topic = Child(BaseTopic)

/**
 * Base class for the help topic command
 */
class BaseTopic extends Command {
  static name = "topic"

  /**
   * The response from `/help topic` is always ephemeral
   * @type {boolean}
   */
  static secret = true

  topic = ""

  static data() {
    return this.builder.addLocalizedStringOption(
      "topic",
      (option) => option.setLocalizedChoices("about", "changes", "commands", "saved", "systems"),
    )
  }

  constructor(interaction) {
    super(interaction)

    this.saveOption("topic")
  }

  perform() {
    /**
     * Registered function to get values for help string interpolation
     * @type Function
     */
    const topicHelpData = helpTopics.get(this.topic)

    const data = {
      returnObjects: true,
    }
    Object.assign(data, topicHelpData(this.locale))

    const help_t = i18n.getFixedT(this.locale, "help")

    const title = help_t(`${this.topic}.title`)
    const body = help_t(`${this.topic}.lines`, data).join("\n")
    return help_t("topics.message", { title, body })
  }

  validate() {
    const topic = helpTopics.get(this.topic)
    if (!topic)
      return this.t("options.topic.validation.unavailable", { topic_name: this.topic })
  }

  static help_data(opts) {
    return {
      topics: listTopics(opts.locale)
    }
  }
}
