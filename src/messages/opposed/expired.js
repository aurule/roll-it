const {
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  MessageFlags,
} = require("discord.js")
const { Opposed } = require("../../db/opposed")
const { i18n } = require("../../locales")

module.exports = {
  state: "expired",
  data: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const participants = opposed_db.getParticipants(challenge_id)
    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    const t_args = {
      attacker: participants.get("attacker").mention,
      defender: participants.get("defender").mention,
      description: challenge.description,
      context: challenge.description ? "description" : undefined,
    }

    if (!test) {
      return {
        content: t("expired.empty", t_args),
      }
    }

    const test = opposed_db.getLatestTestWithParticipants(challenge_id)
    const history = opposed_db.getChallengeHistory(challenge_id)

    t_args.breakdown = test.breakdown
    t_args.leader = test.leader_id ? test.leader.mention : ""
    const key = test.leader ? "expired.winner" : "expired.tied"

    return {
      withResponse: true,
      flags: MessageFlags.IsComponentsV2,
      components: [
        new TextDisplayBuilder({
          content: t(key, t_args),
        }),
        new SeparatorBuilder(),
        new TextDisplayBuilder({
          content: challenge.summary,
        }),
        new TextDisplayBuilder({
          content: t("shared.history.header"),
        }),
        new TextDisplayBuilder({
          content: hitory.join("\n"),
        }),
      ],
    }
  },
}
