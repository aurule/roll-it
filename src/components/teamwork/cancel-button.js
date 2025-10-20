const { ButtonBuilder, ButtonStyle, userMention } = require("discord.js")
const { i18n } = require("../../locales")
const { Teamwork } = require("../../db/teamwork")
const { logger } = require("../../util/logger")

module.exports = {
  name: "teamwork_cancel",
  data: (locale) =>
    new ButtonBuilder()
      .setCustomId("teamwork_cancel")
      .setLabel(i18n.t("prompt.components.cancel", { ns: "teamwork", lng: locale }))
      .setStyle(ButtonStyle.Danger),
  async execute(interaction) {
    const teamwork_db = new Teamwork()
    const teamwork_test = teamwork_db.findTestByMessage(interaction.message.id)

    interaction.authorize(teamwork_test.leader)

    const t = i18n.getFixedT(teamwork_test.locale, "teamwork")

    const { cleanup } = require("../../interactive/teamwork")
    cleanup(teamwork_test.id)

    const t_args = {
      leader: userMention(teamwork_test.leader),
      description: teamwork_test.description,
      context: teamwork_test.description ? "description" : undefined,
    }

    return interaction.ensure(
      "reply",
      {
        content: t("cancelled", t_args),
      },
      {
        component: "teamwork_cancel",
        detail: "could not whisper about teamwork cancellation",
      },
    )
  },
}
