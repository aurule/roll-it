const { Opposed } = require("../../db/opposed")
const { i18n } = require("../../locales")
const build = require("../../util/message-builders")

/**
 * Message shown when the defender relents to the challenge before any tests
 */
module.exports = {
  state: "relented",
  data: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallengeWithParticipants(challenge_id)
    const t = i18n.getFixedT(challenge.locale, "opposed")

    const t_args = {
      attacker: challenge.attacker.mention,
      defender: challenge.defender.mention,
      description: challenge.description,
      context: challenge.description ? "description" : undefined,
    }
    return build.textMessage(t("relented", t_args), { withResponse: true })
  },
}
