const { Opposed } = require("../../db/opposed")
const { i18n } = require("../../locales")
const build = require("../../util/message-builders")

/**
 * Message shown after a tied result is accepted.
 */
module.exports = {
  state: "accepted",
  data: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    const t_args = {
      withResponse: true,
      summary: challenge.summary,
    }
    return build.textMessage(t("accepted", t_args), { withResponse: true })
  },
}
