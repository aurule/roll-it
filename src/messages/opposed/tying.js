const { Opposed } = require("../../db/opposed")
const { i18n } = require("../../locales")
const accept_button = require("../../components/opposed/accept-button")
const retest_picker = require("../../components/opposed/retest-picker")
const retest_button = require("../../components/opposed/retest-button")
const build = require("../../util/message-builders")

/**
 * Status message shown when a result is tied
 */
module.exports = {
  state: "tying",
  data: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const test = opposed_db.getLatestTest(challenge_id)
    const participants = opposed_db.getParticipants(challenge_id)
    const history = opposed_db.getChallengeHistory(challenge_id)

    const t = i18n.getFixedT(challenge.locale, "opposed")

    const components = [
      build.text(
        t("tying.headline", {
          breakdown: test.breakdown,
        }),
      ),
      build.text(
        t("tying.cta", {
          attacker: participants.get("attacker").mention,
          defender: participants.get("defender").mention,
        }),
      ),
      build.actions(accept_button.data(challenge.locale)),
      build.text(t("shared.retest.cta")),
      build.actions(retest_picker.data(challenge)),
      build.actions(retest_button.data(challenge.locale)),
      build.separator(),
      build.text(challenge.summary),
      build.text(t("shared.history.header")),
      build.text(history.join("\n")),
    ]
    return build.message(components, { withResponse: true })
  },
  inert: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const test = opposed_db.getLatestTest(challenge_id)
    const history = opposed_db.getChallengeHistory(challenge_id)

    const t = i18n.getFixedT(challenge.locale, "opposed")

    const components = [
      build.text(
        t("tying.headline", {
          breakdown: test.breakdown,
        }),
      ),
      build.separator(),
      build.text(challenge.summary),
      build.text(t("shared.history.header")),
      build.text(history.join("\n")),
    ]
    return build.message(components, { withResponse: true })
  },
}
