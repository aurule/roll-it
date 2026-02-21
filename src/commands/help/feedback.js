import { all as suggestCommands } from "../../completers/command-completers.js"
import { UserBans } from "../../db/bans.js"
import { Feedback as FeedbackDB } from "../../db/feedback.js"
import { Command } from "../abstract/command.js"
import { Child } from "../abstract/child-command.js"

/**
 * Base class for the help feedback command
 */
class BaseFeedback extends Command {
  static name = "feedback"

  /**
   * The response from `/help feedback` is always ephemeral
   * @type {boolean}
   */
  static secret = true

  message = ""
  command = ""
  consent = "no"

  static data() {
    return this.builder
      .addLocalizedStringOption("message", (option) => option.setMaxLength(1500).setRequired(true))
      .addLocalizedStringOption("command", (option) => option.setAutocomplete(true))
      .addLocalizedStringOption("consent", (option) => option.setLocalizedChoices("yes", "no"))
  }

  constructor(interaction) {
    super(interaction)

    this.saveOption("message")
    this.saveOption("command")
    this.saveOption("consent")
  }

  perform() {
    const feedback = new FeedbackDB()
    feedback.create({
      userId: this.interaction.user.id,
      content: this.message,
      guildId: this.interaction.guildId,
      commandName: this.command,
      canReply: this.consent === "yes",
      locale: this.locale,
    })

    return this.t("response.success")
  }

  validate() {
    const bans = new UserBans(this.interaction.user.id)
    if (bans.is_banned()) return this.t("response.banned")
  }

  autocomplete() {
    const focusedOption = interaction.options.getFocused(true)
    const partialText = focusedOption.value ?? ""

    switch (focusedOption.name) {
      case "command":
        return suggestCommands(partialText)
    }
  }
}

/**
 * Class for the help feedback command
 */
export const Feedback = Child(BaseFeedback, "help")
