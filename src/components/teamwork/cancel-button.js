const { ButtonBuilder, ButtonStyle, userMention } = require("discord.js")
const { i18n } = require("../../locales")
const { Teamwork } = require("../../db/teamwork")
const { logger } = require("../../util/logger")

module.exports = {
  name: "teamwork_cancel",
  data: (locale) =>
    new ButtonBuilder()
      .setCustomId("teamwork_cancel")
      .setLabel(i18n.t("teamwork.prompt.components.cancel", { ns: "interactive", lng: locale }))
      .setStyle(ButtonStyle.Danger),
  async execute(interaction) {
    const teamwork_db = new Teamwork()
    const test = teamwork_db.findTestByMessage(interaction.message.id)

    interaction.authorize(test.leader)

    const t = i18n.getFixedT(test.locale, "interactive", "teamwork")

    const { cleanup } = require("../../interactive/teamwork")
    cleanup(test.id)

    const t_args = {
      leader: userMention(test.leader),
      description: test.description,
      context: test.description ? "description" : undefined,
    }

    return interaction
      .reply({
        content: t("cancelled", t_args),
      })
      .catch((error) =>
        logger.warn(
          { err: error, user: interaction.user.id, component: "teamwork_cancel" },
          `Could not whisper about cancellation`,
        ),
      )
  },
}
