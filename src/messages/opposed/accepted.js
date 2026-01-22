import { Opposed } from "../../db/opposed.js"
import { i18n } from "../../locales/index.js"
const build = require("../../util/message-builders")

/**
 * Message shown after a tied result is accepted.
 */
module.exports = {
  state: "accepted",
  data: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const t = i18n.getFixedT(challenge.locale, "opposed")

    const t_args = {
      summary: challenge.summary,
    }
    return build.textMessage(t("accepted", t_args), { withResponse: true })
  },
}
