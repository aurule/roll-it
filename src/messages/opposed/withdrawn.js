const {
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  MessageFlags,
} = require("discord.js")
const { Opposed } = require("../../db/opposed")
const { i18n } = require("../../locales")

module.exports = {
  state: "withdrawn",
  data: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallengeWithParticipants(challenge_id)
    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    const t_args = {
      attacker: challenge.attacker.mention,
      defender: challenge.defender.mention,
      description: challenge.description,
      context: challenge.description ? "description" : undefined,
    }
    return {
      content: t("withdrawn", t_args),
      withResponse: true,
    }
  },
}
