import { ContextMenuCommandBuilder, ApplicationCommandType } from "discord.js"

import { Feedback } from "../db/feedback.js"
import { UserBans } from "../db/bans.js"
import interactionCache from "../services/interaction-cache.js"
import { i18n } from "../locales.js"
import { canonical, mapped } from "../locales/helpers.js"
import { ReportRollModal } from "../modals/report-roll.js"

const botId = process.env.CLIENT_ID

const command_id = "report-this-roll"

module.exports = {
  i18nId: command_id,
  name: canonical("name", command_id),
  type: "menu",
  global: true,
  data: () =>
    new ContextMenuCommandBuilder()
      .setName(canonical("name", command_id))
      .setNameLocalizations(mapped("name", command_id))
      .setType(ApplicationCommandType.Message),
  async execute(interaction) {
    const t = i18n.getFixedT(interaction.locale, "commands", "report-this-roll")

    const bans = new UserBans(interaction.user.id)
    if (bans.is_banned()) {
      return interaction.whisper(t("response.banned"))
    }

    const message = interaction.targetMessage
    if (message.author.id != botId) {
      return interaction.whisper(t("validation.foreign"))
    }

    const cachedInvocation = await interactionCache.getMessage(interaction.targetMessage)

    const feedback = new Feedback()
    const result = feedback.create({
      userId: interaction.user.id,
      guildId: interaction.guildId,
      locale: interaction.locale,
      commandName: cachedInvocation?.commandName,
      content: JSON.stringify({
        options: cachedInvocation?.options,
        message: message.content,
      }),
    })

    const modal = ReportRollModal.data(result.lastInsertRowid, interaction.locale)

    return interaction.showModal(modal)
  },
}
