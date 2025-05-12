const { ButtonBuilder, ButtonStyle, userMention } = require("discord.js")
const { i18n } = require("../../locales")
const { Opposed } = require("../../db/interactive")
const { logger } = require("../../util/logger")

module.exports = {
  name: "opposed_withdraw_challenge",
  data: (locale) =>
    new ButtonBuilder()
      .setCustomId("opposed_withdraw_challenge")
      .setLabel(i18n.t("opposed.prompt.components.withdraw", { ns: "interactive", lng: locale }))
      .setStyle(ButtonStyle.Secondary),
  async execute(interaction) {
    const opposed_db = new Opposed()
    // const challenge = opposed_db.findTestByMessage(interaction.message.id)

    // const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    // if (interaction.user.id !== test.leader) {
    //   return interaction
    //     .whisper(t("unauthorized", { leader: userMention(test.leader) }))
    //     .catch((error) =>
    //       logger.warn(
    //         { err: error, user: interaction.user.id, component: "teamwork_cancel" },
    //         `Could not whisper about unauthorized usage from ${interaction.user.id}`,
    //       ),
    //     )
    // }

    // TODO edit or remove prompt

    // const { cleanup } = require("../../interactive/teamwork")
    // cleanup(test.id)

    // const t_args = {
    //   leader: userMention(test.leader),
    //   description: test.description,
    //   context: test.description ? "description" : undefined,
    // }

    return interaction
      .reply({
        // content: t("withdrawn", t_args),
        content: "nevermind",
      })
      .catch((error) =>
        logger.warn(
          { err: error, user: interaction.user.id, component: "opposed_withdraw_challenge" },
          `Could not whisper about cancellation`,
        ),
      )
  },
}
