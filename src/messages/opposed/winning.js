const { Opposed } = require("../../db/opposed")
const { i18n } = require("../../locales")
const concede_button = require("../../components/opposed/concede-button")
const retest_picker = require("../../components/opposed/retest-picker")
const retest_button = require("../../components/opposed/retest-button")
const build = require("../../util/message-builders")

module.exports = {
  state: "winning",
  data: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const test = opposed_db.getLatestTestWithParticipants(challenge_id)
    const history = opposed_db.getChallengeHistory(challenge_id).join("\n")

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    const components = [
      build.text(
        t("winning.headline", {
          leader: test.leader.mention,
          breakdown: test.breakdown,
        }),
      ),
      build.text(
        t("winning.cta", {
          leader: test.leader.mention,
          trailer: test.trailer.mention,
        }),
      ),
      build.actions(concede_button.data(challenge.locale)),
      build.text(t("shared.retest.cta")),
      build.actions(retest_picker.data(challenge)),
      build.actions(retest_button.data(challenge.locale)),
      build.separator(),
      build.text(challenge.summary),
      build.text(t("shared.history.header")),
      build.text(history),
    ]
    return build.message(components, { withResponse: true })
  },
  inert: (challenge_id) => {
    const opposed_db = new Opposed()
    const challenge = opposed_db.getChallenge(challenge_id)
    const test = opposed_db.getLatestTestWithParticipants(challenge_id)
    const history = opposed_db.getChallengeHistory(challenge_id)

    const t = i18n.getFixedT(challenge.locale, "interactive", "opposed")

    const components = [
      build.text(
        t("winning.headline", {
          leader: test.leader.mention,
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
