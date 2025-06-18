const {
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  MessageFlags,
} = require("discord.js")
const { Opposed } = require("../../db/opposed")
const { i18n } = require("../../locales")

module.exports = {
  state: "conceded",
  data: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const test = opposed_db.getLatestTestWithParticipants(challenge_id)
    const history = opposed_db.getChallengeHistory(challenge_id).join("\n")

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    return {
      withResponse: true,
      flags: MessageFlags.IsComponentsV2,
      components: [
        new TextDisplayBuilder({
          content: t("conceded", {
            leader: test.leader.mention,
            trailer: test.trailer.mention,
          }),
        }),
        new SeparatorBuilder(),
        new TextDisplayBuilder({
          content: challenge.summary,
        }),
        new TextDisplayBuilder({
          content: t("shared.history.header"),
        }),
        new TextDisplayBuilder({
          content: history,
        }),
      ],
    }
  },
}
