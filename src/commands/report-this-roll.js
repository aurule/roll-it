const { ContextMenuCommandBuilder, ApplicationCommandType } = require("discord.js")

const { Feedback } = require("../db/feedback")
const interactionCache = require("../services/interaction-cache")
const { i18n } = require("../locales")
const { canonical, mapped } = require("../locales/helpers")
const ReportRollModal = require("../modals/report-roll")

require("dotenv").config()
const botId = process.env.CLIENT_ID

const command_id = "report-this-roll"

module.exports = {
  id: command_id,
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
