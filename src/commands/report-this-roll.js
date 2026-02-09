import { ApplicationCommandType } from "discord.js"

import { Feedback } from "../db/feedback.js"
import { UserBans } from "../db/bans.js"
import interactionCache from "../services/interaction-cache.js"
import { canonical } from "../locales/helpers.js"
import { ReportRollModal } from "../modals/report-roll.js"
import { ContextCommand } from "./abstract/context-command.js"
import { registerCommand } from "./index.js"

/**
 * Class for the report roll command
 */
export class ReportThisRoll extends ContextCommand {
  static i18nId = "report-this-roll"
  static name = canonical("name", this.i18nId)
  static global = true

  static data() {
    return this.builder
      .setType(ApplicationCommandType.Message)
  }

  /**
   * Show the feedback modal
   * @return {Promise} Modal promise
   */
  async execute() {
    const bans = new UserBans(this.interaction.user.id)
    if (bans.is_banned()) {
      return this.interaction.whisper(this.t("response.banned"))
    }

    const message = this.interaction.targetMessage
    if (message.author.id != process.env.CLIENT_ID) {
      return this.interaction.whisper(this.t("validation.foreign"))
    }

    const cachedInvocation = await interactionCache.getMessage(this.interaction.targetMessage)

    const feedback = new Feedback()
    const result = feedback.create({
      userId: this.interaction.user.id,
      guildId: this.interaction.guildId,
      locale: this.locale,
      commandName: cachedInvocation?.commandName,
      content: JSON.stringify({
        options: cachedInvocation?.options,
        message: message.content,
      }),
    })

    const modal = ReportRollModal.data(result.lastInsertRowid, this.locale)

    return this.interaction.showModal(modal)
  }
}

registerCommand(ReportThisRoll)
