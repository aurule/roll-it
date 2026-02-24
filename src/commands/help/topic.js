import { list as listTopics } from "../../presenters/topic-name-presenter.js"
import { helpTopics } from "../../data/help-topics.js"
import { i18n } from "../../locales/index.js"
import { Command } from "../abstract/command.js"
import { Child } from "../abstract/child-command.js"

/**
 * Base class for the help topic command
 */
class BaseTopic extends Command {
  static name = "topic"

  /**
   * The response from `/help topic` is always ephemeral
   * @type {boolean}
   */
  secret = true

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

  async perform() {
    /**
     * Registered function to get values for help string interpolation
     * @type Function
     */
    const topicHelpData = helpTopics.get(this.topic)

    const data = await topicHelpData(this.locale, this.interaction.guildId)
    data.returnObjects = true

    const help_t = i18n.getFixedT(this.locale, "help")

    const title = help_t(`${this.topic}.title`)
    const body = help_t(`${this.topic}.lines`, data).join("\n")
    return help_t("topics.message", { title, body })
  }

  validate() {
    if (!helpTopics.has(this.topic))
      return this.t("options.topic.validation.unavailable", { topic_name: this.topic })
  }

  static help_data(opts) {
    return {
      topics: listTopics(opts.locale)
    }
  }
}

/**
 * Class for the help topic command
 */
export const Topic = Child(BaseTopic, "help")
