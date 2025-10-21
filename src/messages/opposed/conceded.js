const { Opposed } = require("../../db/opposed")
const { i18n } = require("../../locales")
const build = require("../../util/message-builders")

/**
 * Message shown when one participant refuses to challenge the current win of their opponent
 */
module.exports = {
  state: "conceded",
  data: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const test = opposed_db.getLatestTest(challenge_id)
    const history = opposed_db.getChallengeHistory(challenge_id).join("\n")

    const t = i18n.getFixedT(challenge.locale, "opposed")

    const components = [
      build.text(
        t("conceded", {
          leader: test.leader.mention,
          trailer: test.trailer.mention,
        }),
      ),
      build.separator(),
      build.text(challenge.summary),
      build.text(t("shared.history.header")),
      build.text(history),
    ]
    return build.message(components, { withResponse: true })
  },
}
